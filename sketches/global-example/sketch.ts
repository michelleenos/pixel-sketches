import 'p5/global'
import p5 from 'p5'

p5.disableFriendlyErrors = true

window.setup = function setup() {
    createCanvas(windowWidth, windowHeight)
    background(30)
}

window.draw = function draw() {
    const diameter: number = random(20, 100)
    fill(255, random(), random())
    circle(mouseX, mouseY, diameter)
    const vec = p5.Vector.random2D().mult(200)
    square(vec.x, vec.y, 10)
}
