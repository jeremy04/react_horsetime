class AvailableGames
  SCHEDULE_URL = "https://www.nhl.com/schedule/-/ET?lazyloadStart="
  
  def initialize(date: Time.zone.now.strftime("%Y-%m-%d"), gateway: HttpsGateway)
    @date = date
    @gateway = gateway
  end

  def matchups
    body = @gateway.get(url: "#{SCHEDULE_URL}#{@date}")
    html_doc = Nokogiri::HTML(body)
    div = html_doc.css(".section-subheader + .day-table-horiz-scrollable-wrapper").first

    div.children.css("tr")[1..-1].inject([]) do |acc, row|
      hsh = {}
      hsh[:date] = @date
      teams = row.css(".narrow-matchup__team").children
      home_team = teams[1].attributes["title"].value
      away_team = teams[0].attributes["title"].value
      time = Time.parse(row.css(".matchup-time-or-result").first.text.strip).utc
      hsh[:time] = time
      hsh[:home_team] = home_team
      hsh[:away_team] = away_team
      link = row.css(".wide-time-result a")[0]["href"]
      hsh[:gameId] = link.split("/").last
      acc << hsh
      acc
    end
  end
end