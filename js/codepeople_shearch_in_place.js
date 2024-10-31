var codepeople_search_in_place_generator = function (){
	var $ = jQuery;

	if('undefined' != typeof codepeople_search_in_place_generator_flag) return;
	codepeople_search_in_place_generator_flag = true;

	function isMobile() {
        try{ document.createEvent("TouchEvent"); return true; }
        catch(e){ return false; }
    }

	var popup_is_visible = false,
		screen_reader_alert_timeout,
		autocomplete_timeout,
        results_container = $('.search-in-place-results-container'),
		clickOnLink = function(evt)
		{
			let url = $(this).find('a').attr('href'),
				urlObj,
				highlight;

			if(url)
			{
				if ( 'URL' in window ) {
					urlObj = new URL(url);
					highlight = urlObj.searchParams.get('highlight');
					if ( highlight ) {
						urlObj.searchParams.delete('highlight');
						url = urlObj.toString();
						sessionStorage.setItem( 'highlight', highlight );
					}
				}

				switch (evt.which)
				{
					case 2:
						let _win = window.open(url, '_blank');
						_win.trigger('blur');
						window.focus();
					break;
					case 3:
						return;
					case 1:
					default:
						$(this).find('a').removeAttr('href');
						document.location.href = url;
				}
			}
		},
		hideResultsPopUp = function(force)
		{
			force = force || false;
			popup_is_visible = popup_is_visible || false;

			if(
				force ||
				(popup_is_visible &&
				$('input[name="s"]:focus').length == 0 &&
				$('.search-in-place:hover').length == 0 &&
				$('.search-in-place :focus').length == 0)
			)
			{
				$('.search-in-place-close-icon').remove();
				$('.search-in-place').hide();
				popup_is_visible = false;
			}
		},
		openAccordion = function(e)
		{
			if(e.is(':hidden') || e.closest('.e-n-accordion-item').length || e.closest('.wp-block-themeisle-blocks-accordion-item:not(.open)').length)
			{
				var t,h;

				// e-n-accordion
				t = e.closest('.e-n-accordion-item');
				if(t.length){
					if(t.attr('open') == undefined)
						t.attr('open', 'open');
					return;
				}

				// Elementor accordion
				t = e.closest('.elementor-accordion-item');
				if(t.length)
				{
					if(t.find('ul:eq(0)').is(':hidden')){
						t.find('.elementor-accordion-title:eq(0)').trigger('click');
						return;
					}
				}

				t = e.closest('.elementor-toggle-item');
				if(t.length) {
					t = t.find('[role="button"]:eq(0)');
					if (t.length) {
						t.trigger('click');
						return;
					}
				}

				t = e.closest('.elementor-tab-content');
				if(t.length)
				{
                    var p;
                    while(t.length && t.is(':hidden'))
                    {
						if(!t.hasClass('elementor-active'))
                        {
							h = $('#'+t.attr('id').replace('content', 'title'));
                            if(h.length) h.trigger('click');
							else if(t.attr('data-tab')){
								h = $('.elementor-tab-title[data-tab="'+t.attr('data-tab')+'"]');
								if(h.length) h.trigger('click');
							}
                        }
                        p = t.parent();
                        t = p.closest('.elementor-tab-content');
                    }

					return;
				}

				// Divi accordion
				t = e.closest('.et_pb_toggle_content');
				if(t.length)
				{
					h = t.siblings('.et_pb_toggle_title');
					if(h.length){ h.trigger('click'); return; }
				}

				// Another DIVI accordion
				if(e.closest('.et-learn-more').length){
					h = e.closest('.et-learn-more').find('.heading-more');
					if(h.length){ h.trigger('click'); return; }
				}

				// SiteOrigin accordion
				t = e.closest('.sow-accordion-panel-content');
				if(t.length)
				{
					h = t.siblings('.sow-accordion-panel-header-container');
					if(h.length){ h.find('.sow-accordion-open-button').trigger('click'); return; }
				}

                // BeTheme accordion
                t = e.closest('.answer');
                if(t.length)
                {
                    h = t.siblings('.title');
                    if(h.length){ h.trigger('click');return; }
                }

                // Appilo theme accordion
                t = e.closest('.ei-faq,[class$="_faq"]');
                if(t.length)
                {
                    h = t.find('.collapsed');
                    if(h.length){ h.trigger('click');return; }
                }

                // Helpie FAQ
                t = e.closest('.accordion__item');
                if(t.length)
                {
                    if(e.find('.accordion__body:hidden'))
                    {
                        h = t.find('.accordion__header');
                        if(h.length){ h.trigger('click');return; }
                    }
                }

				// Wpbakery
                t = e.closest('.vc_tta-panel');
                if(t.length)
                {
					t.addClass('active vc_active');
					return;
                }

				// Neve theme
				t = e.closest('.wp-block-themeisle-blocks-accordion-item');
				if(t.length)
				{
					t.find('.wp-block-themeisle-blocks-accordion-item__title').trigger('click');
				}
			}
		},
		scrollToTerm = function(e)
		{
			$('.search-in-place-mark-active').removeClass('search-in-place-mark-active');
			$(e).addClass('search-in-place-mark-active');
			openAccordion(e);
			var y = e.offset().top - (window.innerHeight / 2);

			setTimeout(
				function() {
					window.scrollTo(
						{
							top: y,
							left: 0,
							behavior: 'smooth'
						}
					);
				}, 100
			);
		},
		searchInPlace = function()
		{
            $('[data-disable-enter-key]')
            .on('keypress', function(evt){
                if(evt.keyCode === 13){evt.preventDefault(); evt.stopPropagation(); return false;}
            });

			$('[data-search-in-page]')
			.data('enter-counter', 0)
			.on('click', function(){$(this).data('enter-counter', 0)})
			.closest('form')
			.on('submit', function(evt){
				evt.preventDefault();evt.stopPropagation();
				var s = $('[data-search-in-page]', this), i = s.data('enter-counter'), e = $('.search-in-place-mark:eq('+i+')');
				if(e.length)
				{
					scrollToTerm(e);
					s.data('enter-counter', i+1);
				}
				else s.data('enter-counter', 0);
				hideResultsPopUp(true);
				return false;
			});

			if(jQuery.fn.on){
				$(document).on('mouseover mouseout', '.search-in-place>.item', function(evt){$(this).toggleClass('active');})
						   .on('mousedown', '.search-in-place>.item', clickOnLink)
						   .on('mousedown', '.search-in-place>.label.more', clickOnLink);
			}else{
				$('.search-in-place>.item').live('mouseover mouseout', function(evt){$(this).toggleClass('active');})
										   .live('mousedown', clickOnLink)
										   .live('mousedown', '.search-in-place>.label.more', clickOnLink);
			}
		};

	searchInPlace.prototype = {
		active : null,
		search : '',
		source : '',
		config:{
			min 		 : codepeople_search_in_place.char_number,
			image_width  : 50,
			image_height : 50,
			colors		 : ('highlight_colors' in codepeople_search_in_place) ? codepeople_search_in_place['highlight_colors'] : ['#B5DCE1', '#F4E0E9', '#D7E0B1', '#F4D9D0', '#D6CDC8', '#F4E3C9', '#CFDAF0', '#F4EFEC'],
			areas		 : ('areas' in codepeople_search_in_place) ? codepeople_search_in_place['areas'] : ['div.hentry', '#content', '#main', 'div.content', '#middle', '#container', '#wrapper', 'article', '.elementor', 'body']
		},

		autohide : function(){
			var me = this,
				selector = 'input[name="s"]';

			function aux_scroll_autocomplete( e ) {
				var a = $(e).next('[name="cpsp-autocomplete"]');
				if( a.length ) {
					clearTimeout( autocomplete_timeout );

					autocomplete_timeout = setTimeout( function() {
						a.show();
						a[0].scrollLeft = e.scrollLeft;
					}, 10 );
					a.hide();
				}
			}
			if(
				'own_only' in codepeople_search_in_place &&
				codepeople_search_in_place.own_only*1
			) selector += '[data-search-in-place]';

			$(document).on('keydown', selector, function(evt){
					if ( evt.keyCode==9 && $('.search-in-place:visible').length ) {
						evt.preventDefault();
						evt.stopPropagation();
						$('.search-in-place:visible a:first').focus();
						return false;
					}
			});

			$(document).on('keydown input keyup focus', selector, function( evt ) {
				aux_scroll_autocomplete( evt.target );
			});

			$(document).on('input keyup focus', selector,
				function(evt){
					var s = $(this),
						v = s.val(),
						close_icon;

					if ( 'key' in evt && evt.key == 'Escape' )	return;
					// If search in page, display the result only if keyup or input and the key is not enter
					if(
						$(evt.currentTarget).data('search-in-page') == 1 &&
						(
							evt.type == 'focus' ||
							evt.keyCode === 13
						)
					) return;

					// Display close icon
					if($('.search-in-place-close-icon').length == 0 && !!!s.data('search-in-page') && isMobile())
					{
						close_icon = $('<span class="search-in-place-close-icon"></span>');
						s.after(close_icon);
						var o = s.offset(),
							w = s.outerWidth()-5,
							h = s.outerHeight(),
							ih = Math.min(close_icon.height(),h-5),
							iw = Math.min(close_icon.width(),ih);
						close_icon.height(ih);
						close_icon.width(iw);
						close_icon.offset({top:o.top + (h-ih)/2, left: o.left+(w-iw)});
					}

					s.attr('autocomplete', 'off');
					if(me.checkString(v)){
						setTimeout( function(){ me.getResults(s); }, 500 );
						popup_is_visible = true;
					}else{
						me.clearAutocomplete(s);
						$('.search-in-place').hide();
						popup_is_visible = false;
					}

					if(evt.type=='keyup' && evt.keyCode==39) me.fromAutocomplete(s);
				}
			);
			$(document).on('click', '.search-in-place-close-icon', function(evt){
				evt.stopPropagation();
				evt.preventDefault();
				hideResultsPopUp(true);
			});
			$(document).on('mouseover', ':not(.search-in-place, .search-in-place *)', function(){
				if(!isMobile()) setTimeout(hideResultsPopUp, 150);
			});
			$(document).on('blur', 'input[name="s"]',function(){
				// Remove the autocomplete
				var e = $(this), bg = e.data('background-color');
				if(typeof bg != 'undefined') e.css('background-color', bg);
				$('[name="cpsp-autocomplete"]').remove();
			});
			$(document).on('click', ':not(input[name="s"])',function(){
				// Remove the autocomplete
				setTimeout(hideResultsPopUp, 150);
			});
			$(document).on('keyup', function(evt){
				if( evt.key == 'Escape' ) hideResultsPopUp(true);
			});
		},

		checkString : function(v){
			return this.config.min <= v.length;
		},

		getResults : function(e){
			var me 	= this,
				source = (e.data('search-in-page')) ? 'source' : 'website';

			function processResults(r)
			{
				if('object' == typeof r)
				{
					if('result' in r)
					{
						me.displayResult(r['result'], s, source);
					}

					if('autocomplete' in r && r['autocomplete'].length)
					{
						me.autocomplete(r['autocomplete'][0], e);
					}
					else
					{
						me.clearAutocomplete(e);
					}
				}
			}

			if(
                (source == 'website' && !results_container.length) ||
                (source == 'source' && e.data('no-popup') == undefined)
            )
			{
                var	o = e.offset(),
					s = $('.search-in-place'),
					sw = e.outerWidth(),
					so = {'left' : o.left, 'top' : (parseInt(o.top) + e.outerHeight()+5)};

				if(me.search == e.val() && s.length && me.source == source)
				{
					s.show().width(sw).offset(so);
					return;
				}

				// Remove results container inserted previously
				s.remove();
				s = $('<div class="search-in-place"></div>');

				s.appendTo('body');

				s.width(sw).offset(so);
				me.displayLoading(s);
			}

			me.search = e.val();
			me.source = source;

			if(source == 'source')
			{
				me.exclude_hidden = e.data('exclude-hidden') || 0;

				// Search in page
				var terms = me.search.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ');
				if('operator' in codepeople_search_in_place && codepeople_search_in_place['operator'] == 'and')
				terms = [terms];
				else
				terms = terms.split(' ');
				$('.search-in-place-mark').each(function(){
					var p = $(this).parent();
					$(this).contents().filter(function() {return this.nodeType === 3;}).unwrap();
					p[0] = p[0].normalize();
				});

				var result = searchObj.highlightTerms(terms);
				if(e.data('no-popup') == undefined)
				{
					processResults(result);
					$('.search-in-place-more').remove();
					$('.search-in-place .title a').on('mousedown', function(evt){
						evt.preventDefault();
						evt.stopPropagation();
						e.trigger('blur');
						scrollToTerm($($(evt.target).attr('href')));
						hideResultsPopUp(true);
					});
				}
			}
			else
			{
				// Search in website
				var p = {'s': me.search, action: 'search_in_place'};

				if('lang' in codepeople_search_in_place) p.lang = codepeople_search_in_place.lang;

				// Stop all search actions
				if(me.active) me.active.abort();

				me.active = jQuery.ajax({
					url: atob(codepeople_search_in_place.root) + 'admin-ajax.php',
					data: p,
					cache: true,
					dataType: 'json',
					success: function(r){
						processResults(r);
					}
				});
			}
		},

		autocomplete : function(o, e){
			function colorValues(color)
			{
				if (!color) return;
				if (color.toLowerCase() === 'transparent') return [0, 0, 0, 0];
				if (color[0] === '#')
				{
					if (color.length < 7) color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
					return [parseInt(color.substr(1, 2), 16),
							parseInt(color.substr(3, 2), 16),
							parseInt(color.substr(5, 2), 16),
							color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
				}
				if (color.indexOf('rgb') === -1)
				{
					var temp_elem = document.body.appendChild(document.createElement('fictum')),
						flag = 'rgb(1, 2, 3)';
					temp_elem.style.color = flag;
					if (temp_elem.style.color !== flag) return;
					temp_elem.style.color = color;
					if (temp_elem.style.color === flag || temp_elem.style.color === '') return;
					color = getComputedStyle(temp_elem).color;
					document.body.removeChild(temp_elem);
				}
				if (color.indexOf('rgb') === 0)
				{
					if (color.indexOf('rgba') === -1) color += ',1';
					return color.match(/[\.\d]+/g).map(function (a){ return +a });
				}
			};
			var b  = e.data('background-color') || e.css('background-color'),
				c  = colorValues(e.css('color')),
				n  = e.clone(),
				a  = {'position': 'absolute', 'background': b, 'border-color': 'transparent', 'box-shadow': 'none', 'zIndex': 1};

			n.removeAttr('placeholder').removeAttr('required');

			if(e.css('zIndex') == 'auto') e.css('zIndex', 10);
			if(e.css('position') == 'static') e.css('position', 'relative');
			e.data('background-color', b);

			if(c)
			{
				c[3] = 0.5;
				a['color'] = 'rgba('+c.join(',')+')';

			}

			$('[name="cpsp-autocomplete"]').remove();
			e.css('backgroundColor', 'transparent').after(n.attr('name', 'cpsp-autocomplete').val(o).css(a));
			n.width(e.width());
			n.height(e.height());
			n.offset(e.offset());
			n[0].scrollLeft = e[0].scrollLeft;
		},

		fromAutocomplete : function(e){
			var n = e.next('[name="cpsp-autocomplete"]');
			if(n.length && n.val().length) e.val(n.val());
		},

		clearAutocomplete: function(e){
			var n = e.next('[name="cpsp-autocomplete"]');
			if(n.length) n.val('');
		},

		displayResult : function(o, e, src){
			var me = this,
				s  = '',
                c  = 0;

			for(var t in o){
				s += '<div class="label">' + (t != 'source' ? t : '') + '</div>';
				var l = o[t],
                    h = l.length;

                c+=h;

				for(var i=0; i < h; i++){
					s += '<div class="item '+(i+1==h ? 'last': '')+'">';
					if(l[i].thumbnail){
						s += '<div class="thumbnail"><img src="'+l[i].thumbnail+'" style="visibility:hidden;float:left;position:absolute;" /></div><div class="data" style="margin-left:'+(me.config.image_width+5)+'px;min-height:'+me.config.image_height+'px;">';
					}else{
						s += '<div class="data">';
					}

					s += '<span class="title"><a href="'+l[i].link+'">'+(src == 'source' && l[i]['resume'] ? l[i]['resume'] : l[i].title)+'</a></span>';
					if( src == 'source' && l[i].resume) s += '<span class="resume">'+l[i].title+'</span>';
					else if(src != 'source' && l[i].resume) s += '<span class="resume">'+l[i].resume+'</span>';
					if(l[i].author) s += '<span class="author">'+l[i].author+'</span>';
					if(l[i].date) s += '<span class="date">'+l[i].date+'</span>';
					s += '</div>'+
                    '<div style="clear:both;"></div>'+
                    '</div>';
				}
			}
            s += '<div class="label more">';
            if(c)
			{
				if(codepeople_search_in_place.result_number*1 <= c)
				{
					var home = codepeople_search_in_place.home;
					home += ( home.indexOf( '?' ) == -1 ) ? '?' : '&' ;
					if('lang' in codepeople_search_in_place) home += 'lang='+codepeople_search_in_place.lang+'&';
					s += '<a class="search-in-place-more" href="'+home+'s='+this.search+'&submit=Search">'+codepeople_search_in_place.more+' &gt;</a>';
				}
			}
			else
			{
				s += codepeople_search_in_place.empty;
			}
            s += '</div>';

            if(e)
            {
				e.html(s).find('.thumbnail img').on( 'load', function(){
                    var size = me.imgSize(this);
                    $(this).width(size.w).height(size.h).css('visibility', 'visible');
                });
            }
            else if(results_container.length)
            {
                results_container.html(s);
				results_container.find('.thumbnail img').css('visibility', 'visible');
            }

			clearTimeout( screen_reader_alert_timeout );
			screen_reader_alert_timeout = setTimeout(function(){
				if (
					'codepeople_search_in_place' in window &&
					'screen_reader_alert' in codepeople_search_in_place
				) {
					try {
						let el = $( e || results_container );
						if ( el.find('.search-in-place-alert').length == 0 ) {
							let n = el.find('.item').length,
								alert_mssg = codepeople_search_in_place['screen_reader_alert'] + ' ' + n + ' ' + ( n == 1 ? codepeople_search_in_place['screen_reader_alert_result_single'] : codepeople_search_in_place['screen_reader_alert_result_multiple'] );

							if ( el.find('.item').length ) {
								alert_mssg += '. ' + codepeople_search_in_place['screen_reader_alert_instructions'];
							}

							el.prepend(
								'<label class="search-in-place-alert" role="alert">' + alert_mssg + '</label>'
							);
						}
					} catch( err ){}
				}
			}, 1200);
        },

		imgSize : function(e){
			e = $(e);

			var w = e.width(),
				h = e.height(),
				nw, nh;

			if(w > this.config.image_width){
				nw = this.config.image_width;
				nh = nw/w*h;
				w = nw; h = nh;
			}

			if(h > this.config.image_height){
				nh = this.config.image_height;
				nw = nh/h*w;
				w = nw; h = nh;
			}

			return {'w':w, 'h':h};
		},

		displayLoading : function(e){
			e.append('<div class="label"><div class="loading"></div></div>');
		},

		highlightTerms : function(terms){
			var me = this, color, counter = 0, results = {"result":{"source":[]}, "autocomplete":[]};

			/* FOR EVERY ITEM
			{
				"link" : "bookmark",
				"title" : "term",
				"resume" : "text where term appears"
			}
			*/

			innerHighlight = function(text, node, original_text){
				var skip = 0;
				if(3 == node.nodeType) {
					var nodeData 	 = node.data,

						pattern  	 = text.toUpperCase(),
						patternIndex   = replaceTildes(nodeData).toUpperCase().indexOf(pattern),
						patternLength  = text.length,

						summaryLength  = Math.max(('codepeople_search_in_place' in window && 'summary_length' in codepeople_search_in_place) ? codepeople_search_in_place['summary_length']*1 : 20, patternLength),
						half		 = ( summaryLength - patternLength ) / 2,
						left   		 = patternIndex,
						right  		 = nodeData.length - ( patternIndex + patternLength ),

						bookmark;

                    if (
						0 <= patternIndex &&
						$( node ).closest( '.search-in-place-mark' ).length == 0
					) {
						bookmark = replaceNodeContent(node, text, patternIndex);

						if(bookmark !== false)
						{
							if( left < right ) {
								if ( left < half ) right = 2 * half - left;
                                else {
									left  = half;
									right = half;
								}
							} else {
								if ( right < half ) left = 2 * half - right;
								else {
									left  = half;
									right = half;
								}
							}

							left  = Math.max( 0, patternIndex - ( 'search_in_place_characters_before' in window ? search_in_place_characters_before : left ) );

							right = Math.min(patternIndex+patternLength+('search_in_place_characters_after' in window ? search_in_place_characters_after : right), nodeData.length);

							while(left && /[^\W]/.test(nodeData.charAt(left))) left--;
							while(right < nodeData.length && /[^\W]/.test(nodeData.charAt(right))) right++;

							if ( ! results["autocomplete"].length ) {
								let autocomplete,
									autocomplete_match,
									autocomplete_regExp,
									s_input = $('[name="s"][data-autocomplete="1"]:focus');

								if ( s_input.length ) {
									autocomplete = s_input.val();
									autocomplete_regExp = new RegExp( autocomplete.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" ) + "\\s*[^\\s]*", 'i' );
									autocomplete_match = nodeData.match( autocomplete_regExp );
									if ( null != autocomplete_match ) {
										results["autocomplete"].push( autocomplete_match[0] );
									}
								}
							}

							results["result"]["source"].push(
								{
									"link"   : '#'+bookmark,
									"title"  : original_text || text,
									"resume" : nodeData.substring( left, right )+'<span class="ellipsis">[...]</span>'
								}
							);
							skip = 1;
						}
					}
                }
                else if(possibleTextNode(node)) {
					lookupTextNodes(node, text, original_text);
                }
				return skip;
            };

			replaceTildes = function(text)
			{
				if (
					// Arabic
					/[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]|[\u0200]|[\u00A0]/g.test(text) ||
					// Asian
					/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/g.test(text) ||
					// Cyrillic
					/[\u0400-\u04FF]/g.test(text)
				) {
					return text;
				}

				return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			};

			replaceNodeContent = function(node, text, patternIndex) {
				try {
					if(me.exclude_hidden && $(node).parent().is(':hidden')) return false;
					var markNode = document.createElement('mark'),
						startOfText = node.splitText(patternIndex),
						endOfText = startOfText.splitText(text.length),
						matchedText = startOfText.cloneNode(true),
						id;

					counter++;

					id = 'search-in-page-'+counter;
					markNode.setAttribute('id', id);
					markNode.setAttribute('style', 'background-color:'+color);
					markNode.setAttribute('class', 'search-in-place-mark');
					markNode.appendChild(matchedText);
					startOfText.parentNode.replaceChild(markNode, startOfText);
					return id;
				} catch ( err ) {
					return false;
				}
            };

			possibleTextNode = function(node) {
                return (1 == node.nodeType && node.childNodes && !/(script|style)/i.test(node.tagName));
            };

			lookupTextNodes = function(node, text, original_text) {
				for (var i=0; i<node.childNodes.length; i++) {
                    i += innerHighlight(text, node.childNodes[i], original_text);
                }
            };

			$.each(
				me.config.areas,
				function(i, b)
				{
					b = $(b);
					if(b.length){
						b.each(function(){
							var c = this;
							$.each(terms, function(i, term){
								if(term.length >= codepeople_search_in_place.char_number){
									color = me.config.colors[i%me.config.colors.length];
									innerHighlight(replaceTildes(term), c, term);
								}
							});
						});
					}
				}
			);

			return results;
		}
	};


	var	searchObj = new searchInPlace();

	if((codepeople_search_in_place.highlight*1) && codepeople_search_in_place.terms && codepeople_search_in_place.terms.length > 0){
		searchObj.highlightTerms(codepeople_search_in_place.terms);
	}

	if((codepeople_search_in_place.identify_post_type)*1){
		$('.type-post').prepend('<div class="search-in-place-type-post">'+codepeople_search_in_place.post_title+'</div>');
		$('.type-page').prepend('<div class="search-in-place-type-page">'+codepeople_search_in_place.page_title+'</div>');
	}

	searchObj.autohide();

};

jQuery(codepeople_search_in_place_generator);
jQuery(window).on('load', codepeople_search_in_place_generator);
jQuery(window).on('load', function(){
	setTimeout(
		function(){
			try {
				let queryString = window.location.search,
					urlParams = new URLSearchParams(queryString),
					highlight = urlParams.get('highlight');
				if ( null == highlight && 'sessionStorage' in window ) {
					highlight = sessionStorage.getItem('highlight');
					sessionStorage.removeItem('highlight');
				}

				if ( highlight ) {
					highlight = String(highlight).trim();

					if ( ! window.find(highlight) ) {
						highlights = highlight.replace(/\s+/g, ' ').split(' ');
						for ( let i in highlights ) {
							if ( window.find( highlights[i] ) ) return;
						}
					}
				}
			} catch( err ) {}
		}, 1000
	);
});