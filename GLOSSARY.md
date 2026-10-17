# Dicoding Story App

A location-aware story-sharing platform where community members publish and explore visual stories with geographic context.

## Language

**Story**:
A user-published post consisting of a photo, a text description, creation timestamp, author name, and optional geographic coordinates.
_Avoid_: Post, article, feed item, status

**Draft Story**:
An unpublished Story being composed by an Author, holding a captured or uploaded photo, description text, and optional Story Location prior to submission.
_Avoid_: New post payload, form data

**Author**:
The registered community member who created and published a Story.
_Avoid_: Poster, creator, uploader

**Story Feed**:
The collection of published Stories displayed to an authenticated member on the home view, synchronized with the interactive map.
_Avoid_: Timeline, wall, stream

**Story Location**:
The geographic coordinates (latitude and longitude) attached to a Story and visualized as an interactive pin on the map.
_Avoid_: Spot, point, geo-tag

**Active Story**:
The Story currently selected by the member from either the Story Feed or the map, highlighted simultaneously in both views.
_Avoid_: Focused post, current item

**Location Filter**:
The view mode on the Story Feed that controls whether all Stories or only Stories possessing a Story Location are displayed.
_Avoid_: Map toggle, geo filter
