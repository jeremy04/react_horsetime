class AddUserToPlayer < ActiveRecord::Migration[5.1]
  def change
    add_reference :players, :user, foreign_key: true, index: true
  end
end
