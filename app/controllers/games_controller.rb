class GamesController < ApplicationController
  before_action :authenticate!, except: :index

  respond_to :html, :js

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found 

  def new
    @game = Game.new
    available_games = AvailableGames.new(date: '2017-10-11').matchups
    @matchups = available_games.map { |hsh| ["#{hsh[:home_team]} vs. #{hsh[:away_team]}", hsh.to_json] }
  end

  def create
    activation_code = Game.generate_activation_code
    matchup = JSON.parse(params['matchup']).with_indifferent_access
    @game = Game.new(room_code: activation_code, 
                     expires_on: 10.hours.from_now(Time.zone.now),
                     nhl_game: matchup[:gameId], 
                     puck_drop_at: matchup[:time],
                     home_team: matchup[:home_team],
                     away_team: matchup[:away_team],
                     pick_number: 1, 
                     status: 'new')
    @game.save
  end

  def index
    @games = Game.list(current_or_guest_user)
  end

  def nickname
    @game = Game.find(params["game_id"])
    @player = Player.new
  end

  def join
    @schema = join_params(params)
    attrs = @schema.output
    if @schema.success?
      game = Game.find(attrs[:game_id])
      ActiveRecord::Base.transaction do
        player = Player.new(game: game, user: current_user, name: attrs[:name])
        check_unique do
          player.save or raise ActiveRecord::Rollback
        end
        game.manager = player
        game.save or raise ActiveRecord::Rollback
      end
    end
  end

  private

  def check_unique
    begin
      yield
    rescue ActiveRecord::RecordNotUnique
      render file: "/shared/record_not_unique.js.erb"
    end
  end

  def join_params(params)
    JoinSchema.call(params) 
  end

  def record_not_found
    render file: "/shared/record_not_found.js.erb"
  end

end
