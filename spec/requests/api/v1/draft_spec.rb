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
    player = create(:player, game: game, user: create(:user) )
    post("/api/v1/rooms/#{game.room_code}/skaters/draft", { params: params, headers: headers })
    json = JSON.parse(response.body)
    expect(response).to have_http_status(200)
    expect(player.reload.horses["away_team"]).to eql ["Sidney Crosby"]
  end

end
