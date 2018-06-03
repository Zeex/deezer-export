(function() {
    var trackNumbers = {};
    var songs = [];
    var timeoutTimer = null;
    
    var top = 0;
    $('html').scrollTop(0);
    var scrollTimer = setInterval(function() {
        $('html').scrollTop(top);
        top += 50;
        console.log('Scrolling...');
    }, 100);
    
    extractSongs();
    $('.datagrid').bind('DOMNodeInserted DOMNodeRemoved', onRowsChanged);
    
    function extractSongs(grid) {
        $(grid).find('.song').each(function() {
            var number = $(this).find('.datagrid-track-number').text();
            if (!trackNumbers[number]) {
                trackNumbers[number] = true;
                var title = $(this).find('[itemprop=name]').text();
                var artist = $(this).find('[itemprop=byArtist]').text();
                var album = $(this).find('[itemprop=inAlbum]').text();
                songs.push({
                    number: number,
                    title: title,
                    artist: artist,
                    album: album
                });
            };
        });
    }

    function onRowsChanged() {
        extractSongs(this);
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(function() {
            // If after 1 second nothing changes we probably reached the end.
            console.log('Timed out');
            clearInterval(scrollTimer);
            $('.datagrid').unbind('DOMNodeInserted DOMNodeRemoved', onRowsChanged);
            downloadCsv();
        }, 1000);
    }
    
    // https://stackoverflow.com/a/18197341
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);  
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    
    function downloadCsv() {
        var csvContent = 'Title,Album,Artist\n';
        songs.sort(function(s1, s2) {
            return s1.number - s2.number;
        });
        console.log('Got ' + songs.length + ' songs');
        for (var i = 0; i < songs.length; i++) {
            var song = songs[i];
            var csvEntry = [
                '"' + song.title  + '"',
                '"' + song.album  + '"', 
                '"' + song.artist  + '"'
            ].join(', ');
            csvContent += csvEntry + '\n';
        }
        download('music.csv', csvContent);
    }
})();