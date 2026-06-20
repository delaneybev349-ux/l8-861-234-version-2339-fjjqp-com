(function () {
  var movies = window.MOVIE_SEARCH_INDEX || [];
  var form = document.querySelector('[data-site-search-form]');
  var input = document.querySelector('[data-site-search-input]');
  var typeSelect = document.querySelector('[data-site-search-type]');
  var yearSelect = document.querySelector('[data-site-search-year]');
  var count = document.querySelector('[data-site-search-count]');
  var results = document.querySelector('[data-site-search-results]');

  if (!form || !input || !results) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function matchYear(movieYear, selectedYear) {
    if (!selectedYear) {
      return true;
    }
    if (selectedYear === '2022') {
      return Number(movieYear) <= 2022;
    }
    return String(movieYear) === selectedYear;
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var selectedType = typeSelect ? typeSelect.value : '';
    var selectedYear = yearSelect ? yearSelect.value : '';

    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedType && String(movie.type).indexOf(selectedType) === -1) {
        return false;
      }
      if (!matchYear(movie.year, selectedYear)) {
        return false;
      }
      return true;
    }).slice(0, 120);

    if (count) {
      count.textContent = '显示 ' + matched.length + ' / ' + movies.length + ' 部';
    }

    if (!matched.length) {
      results.innerHTML = '<p class="empty-state">没有找到匹配影片，请换一个关键词。</p>';
      return;
    }

    results.innerHTML = matched.map(function (movie) {
      return [
        '<article class="search-result-card">',
        '  <a href="' + escapeHtml(movie.href) + '"><img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '"></a>',
        '  <div>',
        '    <h2><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta-row">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '      <span>' + escapeHtml(movie.genre) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }).join('\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
  });

  input.addEventListener('input', render);
  if (typeSelect) {
    typeSelect.addEventListener('change', render);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', render);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    input.value = q;
  }
  render();
}());
