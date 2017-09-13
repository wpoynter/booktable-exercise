#!/usr/bin/env ruby

require 'json'

records = []

JSON.parse(ARGF.read).each do |record|
  records << record
  records.last['stars_count'] = records.last['stars_count'].to_f
  records.last['reviews_count'] = records.last['reviews_count'].to_i
end

puts JSON.dump(records)
