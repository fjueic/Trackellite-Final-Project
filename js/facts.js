const quotes = [

    {
        quote: "It flies around the world every 90 minutes, travelling at 5 miles per second"
    },
    {
        quote: "It's 357ft long from end to end - that's about the same as a football pitch"

    },
    {
        quote: "After the moon, the ISS is the second brightest object in our night sky - you don't even need a telescope to see it zoom over your house"
    },
    {
        quote: "There are two bathrooms on board! There's also one gym, six sleeping quarters and a 360 degree bay window"

    },
    {
        quote: " Six spaceships can dock to the station at any one time"
    },
    {
        quote: "    Astronauts have to work out for two hours a day while on board to help keep their muscles in shape while in space "
    },
    {
        quote: "    More than 50 computers control all the systems on the station"
    },
    {
        quote: "    The electrics on the ISS are all connected with eight miles of cabling"
    },
    {
        quote: "230 individuals from 18 countries have visited the International Space Station"

    },

    {
        quote: "205 spacewalks have been carried out since December 1998"

    },

    {
        quote: "The ISS weighs about 420,000kg - that's about the same as 320 cars"
    },

    {
        quote: "It flies through space about 250 miles from the Earth - a craft can get there from Earth in about six hours"

    },

    {
        quote: "The astronaut Peggy Whitson set the record for spending the most total length of time living and working in space at 665 days on 2 September 2017"

    },






]
const quoteTxt = document.querySelector("#quote");
const quoteAuthor = document.querySelector("#quoteAuthor");

function displayQuote() {
    let number = Math.floor(Math.random() * quotes.length);
    quote.innerHTML = quotes[number].quote;

}
setInterval(displayQuote, 5000);