class SessionsController < Devise::SessionsController
  respond_to :js, :html

  def create
    @item = warden.authenticate(auth_options)
    if @item
      sign_in(resource_name, @item)
      set_flash_message!(:notice, :signed_in)
      yield @item if block_given?
      respond_with @item, location: after_sign_in_path_for(@item)
    else
      render nothing: true
    end
  end
  
  private

  def set_redirect_to
    if request.get?
      uri = URI(request.url)
      @redirect_to = "#{uri.path}?#{uri.query}"
    end
  end

end
