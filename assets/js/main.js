$(function () {
  var client = algoliasearch('RMQZ8VRBH1', '422f4e2c8b60adf24b261f2d301c105b');
  var helper = algoliasearchHelper(client, 'solutions-hiring-assignment', {
    facets: [ 'stars_count'],
    disjunctiveFacets: ['food_type', 'payment_options'],
    hitsPerPage: 4
  });

  function useIPGeoLocation() {
    helper.setQueryParameter('aroundLatLngViaIP', true);
  }

  if (navigator.geolocation) {
    var setPosition = function(position) {
      console.log(position.coords.latitude.toString() + ', ' + position.coords.longitude.toString());
      helper.setQueryParameter('aroundLatLng',
          position.coords.latitude.toString() + ', ' + position.coords.longitude.toString()
      );
    }
    navigator.geolocation.getCurrentPosition(setPosition, useIPGeoLocation);
  } else {
    useIPGeoLocation();
  }

  helper.on('result', function(content) {
    renderFacetList(content);
    renderHits(content);
  });

  function renderHits(content) {
    $('#results').html(function(){
      return $.map(content.hits, function(hit){
        return '<a href="#" class="list-group-item list-group-item-action ' +
        'flex-column align-items-start"><div class="media"><img class="d-flex mr-3" src="' +
        hit.image_url +
        '"><div class="media-body"><h2 class="mb-1">' + hit.name + '</h2>' +
        '<div class="rating"><span class="stars_count">' + hit.stars_count + '</span><div class="stars"><div class="empty-stars"></div>' +
        '<div class="filled-stars" style="width: ' + hit.stars_count / 0.05 + '%"></div></div>' +
        '<span class="reviews">(' + hit.reviews_count + ' reviews)</span>' +
        '</div><span class="details">' + hit.food_type + ' | ' + hit.neighborhood + ' | ' + hit.price_range + '</span></div></div></a>'
      });
    });
    $('#results-count').text(content.nbHits);
    $('#results-time').text(content.processingTimeMS / parseFloat(1000));
  }

  $('#food-type-facet').on('click', 'a', function(e) {
    var facetValue = $(this).data('facet');
    helper.clearRefinements('food_type').addDisjunctiveFacetRefinement('food_type', facetValue)
          .search();
  });

  $('#payment-options-facet').on('click', 'a', function(e) {
    var facetValue = $(this).data('facet');
    helper.toggleFacetRefinement('payment_options', facetValue)
          .search();
  });

  $('#rating-facet').on('click', 'a', function(e) {
    var facetValue = $(this).data('facet');

    helper.removeNumericRefinement('stars_count')
          .addNumericRefinement('stars_count', '>=', facetValue)
          .search();
    $('#rating-facet a').removeClass('active');
    $(this).addClass('active');
  });

  function renderFacetList(content) {           //Needs abstracting
    $('#food-type-facet').html(function() {
      return $.map(content.getFacetValues('food_type', {sortBy: ['count:desc']}), function(facet) {
        var link = $('<a href="#" class="list-group-item list-group-item-action">')
          .data('facet', facet.name)
          .attr('id', 'fl-' + facet.name);
        if(facet.isRefined) link.addClass('active');
        link.append($('<span class="name">').text(facet.name));
        return link.append($('<span class="count">').text(facet.count));
      });
    });

    $('#payment-options-facet').html(function() {
      return $.map(content.getFacetValues('payment_options'), function(facet) {
        if (["Visa","MasterCard","AMEX","Discover"].indexOf(facet.name) === -1) return null;
        var link = $('<a href="#" class="list-group-item list-group-item-action">')
          .data('facet', facet.name)
          .attr('id', 'fl-' + facet.name);
        if(facet.isRefined) link.addClass('active');
        link.append($('<span class="name">').text(facet.name));
        return link.append($('<span class="count">').text(facet.count));
      });
    });
  }

  $('#search-query').on('keyup', function() {
    helper.setQuery($(this).val()).search();
  });
  $('.show-more').on('click', function() {
    helper
      .setQueryParameter('hitsPerPage', helper.getQueryParameter('hitsPerPage') + 4)
      .search();
  });
  helper.search();
});
