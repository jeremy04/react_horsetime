DraftSchema = Dry::Validation.Schema do
  configure do
    config.input_processor = :sanitizer
    option :player, Player
    option :game, Game

   def self.messages
      Dry::Validation::Messages.default.merge(
        en: {
          errors: {
            duplicate_player_name?: 'is taken already',
            home_team_quota?: 'Home team quota is already filled',
            away_team_quota?: 'Away team quota is already filled',
            record_found?: 'not found',
          }
        })
    end

    def already_picked?(game_id, choice)
      return false if player.has_horse_for_game?(game_id, choice)
      true
    end

    def record_found?(game_id)
      begin
        game.find(game_id)
      rescue ActiveRecord::RecordNotFound
        false
      end
    end

    def not_duplicate?(game_id, name)
      player.where(game_id: game_id, name: name).first.nil?
    end

  end

  validate(duplicate_player_name?: [:game_id, :choice]) do |game_id, choice|
    already_picked?(game_id, choice)
  end
  required(:horses).schema do
    required(:home_team).value(max_size?: 1)
    required(:away_team).value(max_size?: 1)
  end
  
  required(:choice).filled(:str?)
  required(:game_id).filled(:record_found?)
end
