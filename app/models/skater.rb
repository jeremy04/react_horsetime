require 'net/https'
require 'uri'

class Skater
  def season_stats(game)
    team_info = nhl_team_metadata(game.nhl_game)
    season_stats = matchup_season_stats(team_info)

    home_skaters = find_skaters(season_stats["teams"], team_info[:home_team_id])
    away_skaters = find_skaters(season_stats["teams"], team_info[:away_team_id])

    team_identify = TeamIdentify.new(game)
    horse_link, other_link = team_identify.determine_team

    scrapper = TeamScrapper.new
    scrapper.visit_roster(horse_link)
    horse_lines = scrapper.scrape_players[:players]
    scrapper.visit_roster(other_link)
    other_lines = scrapper.scrape_players[:players]

    home_skaters = home_skaters.map do |skater|
      [
        ["name", skater["fullName"] ],
        ["goals", PlayerStats.new(skater).goals],
        ["assists", PlayerStats.new(skater).assists],
        ["points", PlayerStats.new(skater).points],
        ["team", team_info[:home_team_name] ],
        ["location", "horse_team"]
      ].to_h.with_indifferent_access
    end

    away_skaters = away_skaters.map do |skater|
      [
        ["name", skater["fullName"] ] ,
        ["goals", PlayerStats.new(skater).goals],
        ["assists", PlayerStats.new(skater).assists],
        ["points", PlayerStats.new(skater).points],
        ["team", team_info[:away_team_name] ],
        ["location", "other_team"]
      ].to_h.with_indifferent_access
    end

    home_skaters = home_skaters.map { |skater| skater.merge('name' => normalize(skater['name']) ) }
    away_skaters = away_skaters.map { |skater| skater.merge('name' => normalize(skater['name']) ) }

    points = home_skaters + away_skaters
    points
  end

  private

  def normalize(name)
    name.split.join(" ").downcase.gsub(/[^\w\s\-]/,'')
  end

  def find_skaters(teams, team_id)
    teams.select { |team| team["id"] == team_id }
      .first["roster"]["roster"]
      .map { |player| player["person"] }
      .select { |player| player["primaryPosition"]["code"] != "G" && player["rosterStatus"] != "I" }
  end

  def nhl_team_metadata(game_id)
    uri = "https://statsapi.web.nhl.com/api/v1/game/#{game_id}/feed/live?site=en_nhl"
    body = HttpsGateway.get(url: uri)
    jsonData = JSON.parse(body)
    home_team_id   = jsonData["gameData"]["teams"]["home"]["id"]
    away_team_id   = jsonData["gameData"]["teams"]["away"]["id"]
    home_team_name = jsonData["gameData"]["teams"]["home"]["name"].gsub('é','e')
    away_team_name = jsonData["gameData"]["teams"]["away"]["name"].gsub('é','e')
    { home_team_id: home_team_id, away_team_id: away_team_id, home_team_name: home_team_name, away_team_name: away_team_name }
  end

  def matchup_season_stats(team_info)
    base_url = "https://statsapi.web.nhl.com/api/v1/teams?site=en_nhl&teamId=#{team_info[:home_team_id]},#{team_info[:away_team_id]}"
    uri = "#{base_url}&expand=team.roster,roster.person,person.stats&stats=statsSingleSeason"

    body = HttpsGateway.get(url: uri)
    JSON.parse(body)
  end
end

class TeamIdentify

  def initialize(game, date=Time.now)
    @horse_team = game.home_team
    @latest_game = game.faceoff_stats
    @date = date
  end

  def determine_team
    team = determine_other_team(@latest_game)
    [get_link(@horse_team), get_link(team)]
  end

  private

  def get_link(team)
    uri = URI("https://www.dailyfaceoff.com/teams/")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.ssl_version = :TLSv1_2
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    page = http.get(uri.request_uri)
    doc = Nokogiri::HTML(page.body)
    # Fix montreal canadiens on Daily faceoff
    team = team.gsub('é','e')
    link = doc.css(".site-main_primary.columns a").map { |x| x.attributes["href"].value }.select { |x| x =~ /#{team.gsub(/\W/," ").squish.gsub(" ", "-").downcase}/  }
    "#{link.first}"
  end

  def determine_other_team(element)
    team = if element["awayTeam"] != @horse_team
              element["awayTeam"]
           else
              element["homeTeam"]
          end
    team
  end

end

class TeamScrapper
  def visit_roster(link)
    agent = Mechanize.new
    @page = agent.get(link)
  end

  def scrape_players
    active_links = @page.links.find_all.select do |link| 
      not_injuried(link) && active_player_link(link)
    end
    parse_names(active_links)
  end

  private

  def not_injuried(link)
    !(link.attributes.parent.first && (link.attributes.parent.first[1] =~ /IR/ || link.attributes.parent.first[1] =~ /G/)  ) 
  end

  def active_player_link(link)
    link.attributes.first[1] =~ /players\/news/
  end

  def parse_names(links)
    { :players => links.map { |link| link.text.gsub("\n","").gsub("\t","") }.uniq }
  end

end
