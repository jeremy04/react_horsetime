class GamesController < ApplicationController
  before_action :authenticate_user!, except: :index

  def index
    @games = Game.includes(:manager).all
  end

  def join
  end

end
