# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170808015043) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "citext"

  create_table "games", id: :serial, force: :cascade do |t|
    t.citext "room_code", null: false
    t.datetime "expires_on"
    t.integer "pick_number"
    t.string "status", limit: 30, default: "new", null: false
    t.string "matchup", limit: 80
    t.bigint "player_id"
    t.index ["player_id"], name: "index_games_on_player_id"
  end

  create_table "picks", id: :serial, force: :cascade do |t|
    t.integer "player_id", null: false
    t.integer "game_id", null: false
    t.integer "pick_number"
    t.datetime "expires_on"
    t.index ["game_id"], name: "index_picks_on_game_id"
    t.index ["player_id"], name: "index_picks_on_player_id"
  end

  create_table "players", id: :serial, force: :cascade do |t|
    t.string "name"
    t.jsonb "horses", default: {}, null: false
    t.integer "game_id", null: false
    t.index ["game_id"], name: "index_players_on_game_id"
    t.index ["horses"], name: "index_players_on_horses", using: :gin
  end

  add_foreign_key "games", "players"
  add_foreign_key "picks", "games"
  add_foreign_key "picks", "players"
  add_foreign_key "players", "games"
end
