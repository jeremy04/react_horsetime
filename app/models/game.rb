class Game < ActiveRecord::Base
  has_one :manager,  class_name: "Player"
  has_many :players
  
  def matchup
    "#{home_team} vs. #{away_team}"
  end

end
