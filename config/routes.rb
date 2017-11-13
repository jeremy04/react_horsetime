Rails.application.routes.draw do
  devise_for :users, skip: [:sessions]
  as :user do
    get 'users/sign_out', to: 'sessions#destroy', as: :destroy_user_session
    get 'users/sign_in', to:  'sessions#new', as: :new_user_session
    post 'users/sign_in', to: 'sessions#create', as: :user_session
  end

  resources :games do
    get 'nickname'
    post 'join'
  end

  namespace :api, constraints: { format: 'json' } do
    namespace :v1 do
      get 'rooms/:room_code/skaters/season_stats', to: 'skaters#season_stats'
      post 'rooms/:room_code/skaters/draft', to: 'skaters#draft'
    end

  end
 
  root 'games#index'

end
