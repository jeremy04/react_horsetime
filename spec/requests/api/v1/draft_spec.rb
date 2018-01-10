require "rails_helper"

describe "Draft API", :type => :request do
  let(:headers) do
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  end

  it "draft choice" do
    params = { choice: "Sidney Crosby", team: "away_team" }
    params = JSON.dump(params)
    game = create(:game)
    existing_horses = { "away_team": ["Evgeni Malkin"], "home_team": [] }
    
    player = create(:player, game: game, user: create(:user), horses: existing_horses )
    post("/api/v1/rooms/#{game.room_code}/skaters/draft", { params: params, headers: headers })
    json = JSON.parse(response.body)
    expect(response).to have_http_status(200)
    expect(json).to eql({ "success" => true })
    expect(player.reload.horses["away_team"]).to include("Sidney Crosby", "Evgeni Malkin")
  end

  it "drafting too many on the same team" do
    params = { choice: "Sidney Crosby", team: "away_team" }
    params = JSON.dump(params)
    game = create(:game)
    existing_horses = { "away_team": ["One", "Two"], "home_team": [] }
    
    player = create(:player, game: game, user: create(:user), horses: existing_horses )
    post("/api/v1/rooms/#{game.room_code}/skaters/draft", { params: params, headers: headers })
    json = JSON.parse(response.body)
    expect(response).to have_http_status(200)
    expect(json).to eql(
      { 
        "success": false, 
        "errors": {
        "horses":
          {
            "away_team": ["away_team size cannot be greater than 2"]
          }
        } 
      }.with_indifferent_access
    )
  end

end
