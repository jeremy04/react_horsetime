class Player < ActiveRecord::Base
  belongs_to :game
  belongs_to :user
  serialize :horses, HashSerializer 
  store_accessor :home_team, :away_team
end
