class Game < ActiveRecord::Base
  has_one :manager,  class_name: "Player"
  has_many :players
end
