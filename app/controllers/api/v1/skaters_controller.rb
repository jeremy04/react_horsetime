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

      private

      def skater_params
        params.permit(:room_code)
      end

    end
  end
end
