class FixPostgresHashIssue < ActiveRecord::Migration[5.1]
  def change
    change_column_default :players, :horses, from: '{}', to: {}
  end
end
