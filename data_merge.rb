#!/usr/bin/env ruby

require 'json'
require 'csv'

ID_COLUMN_TITLE = 'objectID'

restaurants_info = {}

File.open("resources/dataset/restaurants_info.csv") do |f|
  cols = []
  index_of_id = nil
  f.each_with_index do |line, index|
    data = line.rstrip.split(';')
    if index == 0
      #Set up columns
      cols = data
      index_of_id = cols.index ID_COLUMN_TITLE
    else
      #Read data
      restaurants_info[data[index_of_id].to_i] = {}
      data.each_with_index do |value, index|
        restaurants_info[data[index_of_id].to_i][cols[index]] = value
      end
    end
  end
end

JSON.parse(File.open("resources/dataset/restaurants_list.json").read).each do |record|
  record.reject { |k| k == ID_COLUMN_TITLE }.each do |k, v|
    restaurants_info[record[ID_COLUMN_TITLE]][k] = v
  end
end

puts JSON.dump(restaurants_info.values)
