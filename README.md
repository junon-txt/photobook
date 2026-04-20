# photobook

Photo collection


!!!!Instructions for claude [should be removed as they are only instructions for developing, we should have a README for users|visitors after]:

# Web Page

This repo has implementation for a webpage designed to share photos on an interactive web. It's meant to have a beautiful AI that can be viewed both on Desktop and Mobile. 

## Web Development

This is meant to be implemented using the most reliable Front-End techonologies in a way that is easy to maintain even for a back-end developer.
- Abstractions should be tiny & elegant
- Should be properly modularized and re-use logic whenever possible
- Since both Desktop and Mobile|responsive should be available, whenever logic changes we should hide implementation using meaningfull abstractions instead.
- Book & Pages UI component are drawn programatically as they are animated. Passing pages mimic passing pages.

## Desktop

This serves as the main way to enjoy the webpage.

The Web page simulates a photobook (a book with images attached to it via glue or adhesive tape in the corners) in order to enjoy a journey over the photos without any distraction of social media.

The interface should an open book with two visible opened pages (left half and right half). Photos can be displayed on both pages.

Hovering a photo makes it pop to fill most of the screen as if it has been "zoomed in". Clicking on it will make it go back to previous UI state.

Photos can be accompanied by text (using a font that tries to immitate pen writing with configurable color).

Hovering a text displays both the photo and the text in "zoomed in" but this time with the photo not taking as much space as the text.
(If audio is available for this photo a audio speaker emoji can be clicked to play it. if the UI is reset to the photobook pages, the audio stops).

Clicking on left|right most ends pass pages in desired direction.

## Mobile

This mimis Desktop but is meant to be using the phone flipped in order to see the "book" UI horizontally and images in horizontal aspect ratio.

Clicks are replaced by touchs. 