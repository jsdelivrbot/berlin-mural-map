# Berlin Mural Map

A map showing the street murals in Berlin. Each mural is represented as image thumbnail that can be clicked on for more info. All murals can be viewed in the gallery at the bottom of the page.

Each mural can be geotagged and the caption can be edited. A KML can be downloaded of all the murals.

Uses [Express 4](http://expressjs.com/).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.

```sh
git clone https://github.com/robole/berlin-mural-map
cd berlin-mural-map
npm install
npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Improvements

- Add Mongodb backend to enable more functionality
- File upload - add functionality
- Delete functionality
- Update functionality for fields
- Make more general to create additional layers
- Toggle between clustered markers and individual markers
- Toggle between set icon and custom image for each feature
- Synced selection between marker and image in gallery?
