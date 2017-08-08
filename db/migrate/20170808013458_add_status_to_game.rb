class AddStatusToGame < ActiveRecord::Migration[5.1]
  def change
    add_column :games, :status, :string, limit: 30, default: 'new', null: false, after: :pick_number
    remove_column :games, :ready
  end
end
