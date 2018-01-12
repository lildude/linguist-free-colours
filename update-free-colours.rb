require 'color-proximity'
require 'safe_yaml'
require 'open-uri'

def cut_hash(colour)
  colour[1..-1] if colour.start_with?('#')
end

yaml_content = open('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml') { |f| f.read }
languages = YAML.load(yaml_content, safe: true)
used_colours = languages.collect { |language| cut_hash(language.last['color']) unless language.last['color'].nil? }.compact
free_colours = []
i = 0 # Black
while i < 16777215 do  # White
  str = i.to_s(16).rjust(6, '0')
  print "#{str}\r"
  ncp = ColorProximity.new(0.05, used_colours)
  if ncp.past_threshold?(str).first
    used_colours.push(str)
    free_colours.push(str.upcase)
  end
  i +=1
end

puts "\n#{free_colours.length} free colours"
File.open('avail-colours.yml', 'w') {|f| f.write free_colours.to_yaml }
