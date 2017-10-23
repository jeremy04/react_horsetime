class Game < ActiveRecord::Base
  has_many :players

  def self.generate_activation_code(size=4)
    charset = %w( 2 3 4 6 7 9 A C D E F G H J K M N P Q R T V W X Y Z )
    (0...size).map { charset.to_a[SecureRandom.random_number(charset.size)] }.join
  end

  def matchup
    "#{home_team} vs. #{away_team}"
  end

  def manager
    if player_id
      Player.find(player_id)
    else
      nil
    end
  end

  def skaters
    Rails.cache.fetch("#{cache_key}/skaters", expires_in: 5.hours) do
      Skater.new.season_stats(self)
    end
  end

  def faceoff_stats
    { 
      "date": self.puck_drop_at.to_date.to_s, 
      "gameID": self.nhl_game, 
      "awayTeam": self.away_team, 
      "homeTeam": self.home_team
    }.with_indifferent_access
  end

  # Empty manager not allowed
  def manager=(player)
    if player.try(:id)
      self.player_id = player.id
    end
  end

  def self.list(user)
    user_eql = sanitize_sql_array(['"users"."id" = ?', user.id])
    player_eql = sanitize_sql_array(['"players"."user_id" = ?', user.id])
    query = <<-SQL
    LEFT OUTER JOIN "players" ON "players"."game_id" = "games"."id" AND #{player_eql} 
    LEFT OUTER JOIN "users" ON "users"."id" = "players"."user_id" AND #{user_eql}
    SQL
    self.select('"games".*, "users"."id" as joined_game, "players"."name" as player_name')
      .joins(query)
      .order(id: :desc)
  end
end
