Rails.application.routes.draw do
  devise_for :users, skip: [:sessions]
  as :user do
    get 'users/sign_out', to: 'sessions#destroy', as: :destroy_user_session
    get 'users/sign_in', to:  'sessions#new', as: :new_user_session
    post 'users/sign_in', to: 'sessions#create', as: :user_session
  end

  resources :games do
    post 'join'
  end

  root 'games#index'

end
