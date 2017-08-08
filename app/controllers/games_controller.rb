class GamesController < ApplicationController
  def index
    @games = Game.includes(:manager).all
  end
end
