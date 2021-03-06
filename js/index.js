$(function () {
    var playerTrack = $("#player-track"),
        bgArtwork = $('#bg-artwork'),
        bgArtworkUrl, albumName = $('#album-name'),
        trackName = $('#track-name'),
        albumArt = $('#album-art'),
        sArea = $('#s-area'),
        seekBar = $('#seek-bar'),
        trackTime = $('#track-time'),
        insTime = $('#ins-time'),
        sHover = $('#s-hover'),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find('i'),
        tProgress = $('#current-time'),
        tTime = $('#track-length'),
        seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime,
        buffInterval = null,
        tFlag = false,
        albums = ['Dawn', 'Me & You', 'Electro Boy', 'Home', 'Proxy (Original Mix)'],
        trackNames = ['Skylike - Dawn', 'Alex Skrindo - Me & You', 'Kaaze - Electro Boy', 'Jordan Schor - Home', 'Martin Garrix - Proxy'],
        albumArtworks = ['_1', '_2', '_3', '_4', '_5'],
        trackUrl = ['images/2.mp3', 'images/1.mp3', 'images/3.mp3', 'images/4.mp3', 'images/5.mp3'],
        playPreviousTrackButton = $('#play-previous'),
        playNextTrackButton = $('#play-next'),
        currIndex = -1,
        musicSound = $('#musicSound input');
        musicVolumn = $('#musicVolumn .aplayer-volume-wrap');

    function playPause() {
        setTimeout(function () {
            if (audio.paused) {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class', 'fas fa-pause');
                audio.play();
            } else {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class', 'fas fa-play');
                audio.pause();
            }
        }, 300);
    }


    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds);

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0);

    }

    function hideHover() {
        sHover.width(0);
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0);
    }

    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!tFlag) {
            tFlag = true;
            trackTime.addClass('active');
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            tTime.text('00:00');
        else
            tTime.text(durMinutes + ':' + durSeconds);

        if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds))
            trackTime.removeClass('active');
        else
            trackTime.addClass('active');


        seekBar.width(playProgress + '%');

        if (playProgress == 100) {
            i.attr('class', 'fa fa-play');
            seekBar.width(0);
            tProgress.text('00:00');
            albumArt.removeClass('buffering').removeClass('active');
            clearInterval(buffInterval);
            selectTrack2(1);
        }

        // 歌词高亮 update
        calLineno(audio.currentTime);
        lineHeight();
    }

    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function () {
            if ((nTime == 0) || (bTime - nTime) > 1000)
                albumArt.addClass('buffering');
            else
                albumArt.removeClass('buffering');

            bTime = new Date();
            bTime = bTime.getTime();

        }, 100);
    }

    function selectTrack2(flag) {
        $.getJSON('http://jmusic.jetchen.cn/api/rand.music?', {
            sort: '热歌榜'
            ,format: 'json'
        }, function(json, textStatus) {
            if (json.code == 1) {
                if (flag == 0)
                    i.attr('class', 'fa fa-play');
                else {
                    albumArt.removeClass('buffering');
                    i.attr('class', 'fa fa-pause');
                }

                seekBar.width(0);
                trackTime.removeClass('active');
                tProgress.text('00:00');
                tTime.text('00:00');

                currAlbum = json.data.artistsname;
                currTrackName = json.data.name;
                currArtwork = json.data.picurl;

                audio.src = json.data.url;

                nTime = 0;
                bTime = new Date();
                bTime = bTime.getTime();

                if (flag != 0) {
                    audio.play();
                    playerTrack.addClass('active');
                    albumArt.addClass('active');

                    clearInterval(buffInterval);
                    checkBuffering();
                }

                albumName.text(currAlbum);
                trackName.text(currTrackName);
                albumArt.find('img.active').removeClass('active');
                $('#album-pic').addClass('active');

                $('#album-pic').attr('src',currArtwork);

                bgArtwork.css({
                    'background-image': 'url(' + currArtwork + ')'
                });

                getLrc(json.data.url);

            }
        });
    }

    function changeSound(e, offFlag) {
        let height = Number($('#musicVolumn .aplayer-volume-bar').css('height').replace('px',''));
        let top = $('.aplayer-volume-bar').offset().top;
        let click = top + height*0.6;
        if (e) {
            click = e.clientY;
        }
        if (offFlag) {
            if ($('#musicVolumn i').hasClass('fa-volume-up')) {
                click = height - Number($('#musicVolumn .aplayer-volume').attr('t').replace('px','')) + top;
            } else {
                $('#musicVolumn .aplayer-volume').attr('t', $('#musicVolumn .aplayer-volume').css('height'))
                click = top + height;
            }
        }

        let percent = (top+height-click)/height;
        $('#musicVolumn .aplayer-volume').css('height', percent*100+'%');
        audio.volume = percent;
    }
    function initPlayer() {
        audio = new Audio();

        selectTrack2(0);

        audio.loop = false;

        playPauseButton.on('click', playPause);

        sArea.mousemove(function (event) {
            showHover(event);
        });

        sArea.mouseout(hideHover);

        sArea.on('click', playFromClickedPos);

        $(audio).on('timeupdate', updateCurrTime);

        playPreviousTrackButton.on('click', function () {
            selectTrack2(-1);
        });
        playNextTrackButton.on('click', function () {
            selectTrack2(1);
        });

        musicVolumn.on('mousemove', function() {
            $('#musicVolumn i').css('color', '#1f1f1f');
            $('#musicVolumn .aplayer-volume-bar-wrap').show()
        });
        musicVolumn.on('mouseout', function() {
            $('#musicVolumn i').css('color', '#9fa1a3');
            $('#musicVolumn .aplayer-volume-bar-wrap').hide()
        });
        $('#musicVolumn i').on('click', function() {
            if ($('#musicVolumn i').hasClass('fa-volume-up')) {
                $('#musicVolumn i').removeClass('fa-volume-up')
                $('#musicVolumn i').addClass('fa-volume-off')
                changeSound(null, true);
            } else {
                $('#musicVolumn i').removeClass('fa-volume-off')
                $('#musicVolumn i').addClass('fa-volume-up')
                changeSound(null, true);
            }
            
        });

        $('#musicVolumn .aplayer-volume-bar-wrap').on('click', function(e) {
            changeSound(e);
        })
        /*audio.onended = function() {
            selectTrack2(1);
        }*/
        changeSound();
    }
    initPlayer();
});

function getLrc(url) {
    let id = url.split("id=")[1].split(".")[0];
    let lrcUrl = 'http://jmusic.jetchen.cn/api/song/lyric?os=pc&lv=-1&kv=-1&tv=-1&id=' + id;
    $.getJSON(lrcUrl, function(json, textStatus) {
        if (json.code == 200) {
            createLrc(json['lrc']['lyric']);
        }
    })
}

function createLrc (lyric) {
    medisArray = new Array();
    lineno = 0;
    var lyrics = lyric.split("\n");

    $.each(lyrics, function (i, item) {
        var tStr = item.substring(item.indexOf("[") + 1, item.indexOf("]"));
        if (tStr != null) {
            let t = (tStr.split(":")[0] * 60 + parseFloat(tStr.split(":")[1])).toFixed(3);
            let c = item.substring(item.indexOf("]") + 1, item.length);
            if (!!t && !!c) {
                medisArray.push({
                    t: t,
                    c: c
                });
            }
        }
    });
    var lyricDom = $("#lyric_txt");
    lyricDom.empty();
    lyricDom.css('transform', 'translateY(0)')
    $.each(medisArray, function (i, item) {
        var p = $('<p lrcIndex="'+i+'" ></p>');
        p.html(item.c);
        lyricDom.append(p);
    });
}

var lineno = 0;
function lineHeight(){
    var $lyr = $("#lyric_txt");
    // 高亮显示
    $lyr.find('p').removeClass('active');
    var nowline = $lyr.find("p").get(lineno);
    $(nowline).addClass("active");  

    // 实现文字滚动
    if (lineno > 3) {
        let transformPx = (lineno - 3) * 44;
        $lyr.css('transform', 'translateY(-'+transformPx+'px)');
    }
    
}

function calLineno(currentTime) {
    if (medisArray.length < 1) return;
    let t = currentTime.toFixed(3);
    if (lineno >= 0 && t >= parseFloat(medisArray[lineno].t) && t < parseFloat(medisArray[lineno+1].t)) {
        lineno = lineno;
    }

    $.each(medisArray, function (i, item) {
        if (t < parseFloat(item.t)) {
            lineno = i-1;
            return false;
        }
    });
}

