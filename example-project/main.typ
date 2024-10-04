#let data = json("data.json")

#let name = data.name

= Hello, #name!


== Example Image

#figure(
  image(
    "img/resume-generator.png",
    width: 10cm
  )
)