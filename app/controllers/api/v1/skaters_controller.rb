module Api
  module V1
    class SkatersController < ApiController
      # TODO: delete after issue is fixed in Rails 5.1.4 for wrap_parameters
      # https://github.com/rails/rails/pull/29566

      wrap_parameters false

      def season_stats
        game = Game.find_by!(room_code: skater_params[:room_code])
        render json: { success: true, skaters: game.skaters }
      end

      def draft
        game = Game.find_by!(room_code: draft_params[:room_code])
        # Need to implement authorization of player ;) not just take first player hahah
        player = Player.where(game_id: game.id).first
        current_horses = player.horses.dup
        params = draft_params.to_h.merge({ horses: requested_horses(current_horses), game_id: game.id })
        schema = DraftSchema.call(params) 
        if schema.success?
          player.horses = requested_horses(current_horses)
          player.save!
          render json: { success: true }
        else
          render json: { success: false, errors: schema.messages(full: true) }
        end
      end

      private

      def skater_params
        params.permit(:room_code)
      end

      def draft_params
        params.permit(:room_code, :choice, :team)
      end

      def requested_horses(current_horses)
        current_horses.inject([]) do |acc, (key, value)|
          if key == draft_params[:team]
            acc << [key, value + [draft_params[:choice]]]
          else
            acc << [key, value]
          end
          acc
        end.to_h
      end

    end
  end
end
