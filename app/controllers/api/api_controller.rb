module Api
  class ApiController < ActionController::Base
    protect_from_forgery with: :null_session

    before_action :ensure_json_request

    rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

    private

    def ensure_json_request
      return if request.format.symbol == :json
      render nothing: true, status: 406
    end

    def record_not_found(exception)
      render_error(404, 'Not Found')
    end

    def render_error(status, *messages)
      render json: { errors: messages.flatten }, status: status
    end

  end
end
