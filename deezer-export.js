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
    

    const catalog_playlist = 'catalog-content';
    const catalog_fav = 'naboo-catalog-content';

    var catalog_type = null;

    if (document.getElementsByClassName('naboo-catalog-content').length > 0) 
    {
        console.log('Favourites detected');
        catalog_type = catalog_fav;
    }
    else
    {
        console.log('Playlist detected');
        catalog_type = catalog_playlist; 
    }


    extractSongs('.'+catalog_type);
    var $table = $('.'+catalog_type+' *[role=rowgroup]').bind('DOMNodeInserted DOMNodeRemoved', onRowsChanged);
    

    function extractSongs(songList) {
        $(songList).find('*[aria-rowindex]').each(function() {
            var number = $(this).attr('aria-rowindex');
            if (!trackNumbers[number]) {
                trackNumbers[number] = true;
                var song = {
                    number: number,
                    title: 
                        Array.prototype.join.call(
                            $(this).find('[data-testid=title]').map(function() { return $(this).text(); }),
                            ', '),
                    artist:
                        Array.prototype.join.call(
                            $(this).find('[data-testid=artist]').map(function() { return $(this).text(); }),
                            ', '),
                    album:
                        Array.prototype.join.call(
                            $(this).find('[data-testid=album]').map(function() { return $(this).text(); }),
                            ', ')
                }
                songs.push(song);
            };
        });
    }

    function onRowsChanged() {
        extractSongs(this);
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(function() {
            // If after 3 seconds nothing changes we probably reached the end.
            console.log('Timed out');
            clearInterval(scrollTimer);
            $table.unbind('DOMNodeInserted DOMNodeRemoved', onRowsChanged);
            downloadCsv();
        }, 3000);
    }
    onRowsChanged();

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
        download('Playlist.csv', csvContent);
    }
})();