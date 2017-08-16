class GamesController < ApplicationController
  before_action :authenticate!, except: :index

  respond_to :html, :js

  def new
    @game = Game.new
    available_games = AvailableGames.new(date: '2017-10-11').matchups
    @matchups = available_games.map { |hsh| ["#{hsh[:home_team]} vs. #{hsh[:away_team]}", hsh.to_json] }
  end

  def create
    activation_code = generate_activation_code
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
    @games = Game.includes(:manager).all
  end

  def join
  end

  private

  def generate_activation_code(size=4)
    charset = %w( 2 3 4 6 7 9 A C D E F G H J K M N P Q R T V W X Y Z )
    (0...size).map { charset.to_a[SecureRandom.random_number(charset.size)] }.join
  end

  def authenticate!
    return true if user_signed_in?
    respond_to do |format|
      format.js { render file: "/shared/unauthorized.js.erb" }
      format.html { redirect_to root_path, :alert => "please login" }
    end
  end
end
