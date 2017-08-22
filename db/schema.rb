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

ActiveRecord::Schema.define(version: 20170821155033) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "citext"

  create_table "games", id: :serial, force: :cascade do |t|
    t.citext "room_code", null: false
    t.datetime "expires_on"
    t.integer "pick_number"
    t.string "status", limit: 30, default: "new", null: false
    t.bigint "player_id"
    t.string "nhl_game", limit: 50
    t.string "home_team", limit: 50
    t.string "away_team", limit: 50
    t.datetime "puck_drop_at", null: false
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
    t.bigint "user_id"
    t.index ["game_id"], name: "index_players_on_game_id"
    t.index ["horses"], name: "index_players_on_horses", using: :gin
    t.index ["user_id"], name: "index_players_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "guest", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "games", "players"
  add_foreign_key "picks", "games"
  add_foreign_key "picks", "players"
  add_foreign_key "players", "games"
  add_foreign_key "players", "users"
end
