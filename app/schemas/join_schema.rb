JoinSchema = Dry::Validation.Schema do
  configure do
    config.input_processor = :sanitizer
    option :player, Player
    option :game, Game

    def self.messages
      Dry::Validation::Messages.default.merge(
        en: {
          errors: {
            duplicate_player_name?: 'is taken already',
            found?: 'not found',
          }
        })
    end

    def not_duplicate?(game_id, name)
      player.where(game_id: game_id, name: name).first.nil?
    end

    def found?(game_id)
      begin
        game.find(game_id)
      rescue ActiveRecord::RecordNotFound
        false
      end
    end

  end

  validate(duplicate_player_name?: [:game_id, :name]) do |game_id, name|
    not_duplicate?(game_id, name)
  end

  required(:name).filled(:str?)
  required(:game_id).filled(:found?)
end
