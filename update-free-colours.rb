require 'color-proximity'
require 'safe_yaml'
require 'open-uri'

def cut_hash(colour)
  colour[1..-1] if colour.start_with?('#')
end

def update_yml
  # Write to file
  File.open('avail-colours.yml', 'w') {|f| f.write @free_colours.to_yaml }
end

@free_colours ||= YAML.load_file('avail-colours.yml', safe: true) || []

yaml_content = open('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml') { |f| f.read }
languages = YAML.load(yaml_content, safe: true)
used_colours = languages.collect { |language| cut_hash(language.last['color']) unless language.last['color'].nil? }.compact

# Remove used colours, just in case Linguist has updated more recently than us.
@free_colours -= used_colours

i = if @free_colours.empty? # Black
      0
    else
      @free_colours.last.to_i(16) # Start where we left off
    end

puts "Starting at #{i.to_s(16).rjust(6, '0').upcase}"
while i < 16777215 do  # White
  str = i.to_s(16).rjust(6, '0')
  print "#{str}\r"
  ncp = ColorProximity.new(0.05, used_colours)
  if ncp.past_threshold?(str).first
    used_colours.push(str)
    @free_colours.push(str.upcase) unless @free_colours.include?(str.upcase)
  end
  # Update the file every 4095 iterations
  update_yml if i % 4095 == 0
  i +=1
end

puts "\n#{free_colours.length} free colours"
File.open('avail-colours.yml', 'w') {|f| f.write @free_colours.to_yaml }
