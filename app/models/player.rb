class Player < ActiveRecord::Base
  belongs_to :game
  belongs_to :user
  serialize :horses, HashSerializer 
  store_accessor :home_team, :away_team

  scope :with_game, -> (game_id) { where(game_id: game_id) }
  scope :has_horse, -> (team, horse) { where('horses @> ?', { "#{team}": [horse] }.to_json) }
  
  def self.has_horse_for_game?(game_id, choice)
    self.with_game(game_id).has_horse("home_team", choice)
    .or(
      self.has_horse("away_team", choice)
    ).exists?
  end

end

