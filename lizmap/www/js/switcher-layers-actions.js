var lizLayerActionButtons = function() {

    function fillSubDock( html ){
        $('#sub-dock').html( html );
        $('#sub-dock i.close').click(function(){
            $('#sub-dock').hide();
        });

        // activate link buttons
        $('div.sub-metadata button.link')
        .click(function(){

          var self = $(this);
          if (self.hasClass('disabled'))
            return false;
          var windowLink = self.val();
          // Test if the link is internal
          var mediaRegex = /^(\/)?media\//;
          if(mediaRegex.test(windowLink)){
            var mediaLink = OpenLayers.Util.urlAppend(lizUrls.media
              ,OpenLayers.Util.getParameterString(lizUrls.params)
            )
            windowLink = mediaLink+'&path=/'+windowLink;
          }
          // Open link in a new window
          window.open(windowLink);
        });

    }

    function getLayerMetadataHtml( aName ){

        var html = '';

        if( aName in lizMap.config.layers ){
            var layerConfig = lizMap.config.layers[aName];

            // Header
            html+= '<div class="sub-metadata">';
            html+= '<h3>';
            html+='    <span class="title">';
            html+='        <span class="icon"></span>';
            html+='        <span class="text">'+lizDict['layer.metadata.title']+'</span>';
            html+='        <i class="pull-right close icon-remove icon-white"></i>';
            html+='    </span>';
            html+='</h3>';

            // Content
            html+= '<div class="menu-content">';

            html+= '    <dl class="dl-vertical" style="font-size:0.8em;">';
            html+= '        <dt>'+lizDict['layer.metadata.layer.name']+'</dt>';
            html+= '        <dd>'+layerConfig.title+'</dd>';
            html+= '        <dt>'+lizDict['layer.metadata.layer.type']+'</dt>';
            html+= '        <dd>'+lizDict['layer.metadata.layer.type.' + layerConfig.type]+'</dd>';
            if( layerConfig.abstract &&  layerConfig.abstract){
                html+= '        <dt>'+lizDict['layer.metadata.layer.abstract']+'</dt>';
                html+= '        <dd>'+layerConfig.abstract+'</dd>';
            }
            html+= '    </dl>';
            if( layerConfig.link  ){
                html+= '    <button class="btn link" name="link" title="'+lizDict['layer.metadata.layer.info.see']+'" value="'+layerConfig.link+'">'+lizDict['layer.metadata.layer.info.see']+'</button>';
            }

            html+= '</div>';
            html+= '</div>';
        }

        return html;
    }

    // Bind click on layer style selector
    function onStyleSelection( bindClick ){
        $('#switcher-layers-actions a.btn-style-layer').unbind('click');

        if( !bindClick )
            return false;

        $('#switcher-layers-actions a.btn-style-layer').click(function(){
            var eStyle = $(this).text();

            var eName = $('#layerActionStyle').val();
            if( !eName )
                return false;

            var getLayer = lizMap.map.getLayersByName( eName );
            if( !getLayer )
                return false;

            var oLayer = lizMap.map.getLayersByName( eName )[0];
            if( oLayer && eStyle != ''){
                oLayer.params['STYLES'] = eStyle;
                oLayer.redraw( true );

                lizMap.events.triggerEvent(
                    "layerstylechanged",
                    { 'featureType': eName}
                );
            }

            $('#switcher').click(); // blur dropdown
            return false;
        });
    }

    lizMap.events.on({

    'uicreated': function(evt){

        // title tooltip
        $('#switcher-layers-actions .btn').tooltip( {
            placement: 'bottom'

        } );

        // Activate switcher-layers-actions button
        $('#layerActionMetadata').click(function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            var subDockVisible = ( $('#sub-dock').css('display') != 'none' );

            if( !subDockVisible ){
                var html = getLayerMetadataHtml( layerName );

                if( !lizMap.checkMobile() ){
                    var leftPos = lizMap.getDockRightPosition();
                    $('#sub-dock').css('left', leftPos).css('width', leftPos);
                }
                fillSubDock( html );
                $('#sub-dock').show();
            }else{
                $('#sub-dock').hide().html( '' );
            }

            return false;
        });


        $('#layerActionZoom').click(function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            itemConfig = lizMap.config.layers[layerName];
            if( itemConfig.type == 'group' || !( 'extent' in itemConfig ) || !( 'crs' in itemConfig ) )
                return false;

            var lex = itemConfig['extent'];
            var lBounds = new OpenLayers.Bounds(
                lex[0],
                lex[1],
                lex[2],
                lex[3]
            );
            var layerProj = new OpenLayers.Projection( itemConfig.crs );
            var mapProj = lizMap.map.getProjectionObject();
            mapProj = new OpenLayers.Projection( 'EPSG:3857' );
            lBounds.transform(
                layerProj,
                mapProj
            );
            lizMap.map.zoomToExtent( lBounds );
            return false;
        });

        // Export action
        $('#switcher-layers-actions a.btn-export-layer').click(function(){
            var eFormat = $(this).text();
            if( eFormat == 'GML' )
                eFormat = 'GML3';
            var eName = $('#layerActionExport').val();
            if( !eName )
                return false;
            lizMap.exportVectorLayer( eName, eFormat );
            $('#switcher').click(); // blur dropdown
            return false;
        });


        $('#layerActionUnfilter').click(function(){
            var layerName = lizMap.lizmapLayerFilterActive;
            if( !layerName )
                return false;

            lizMap.events.triggerEvent(
                "layerfeatureremovefilter",
                { 'featureType': layerName}
            );
            lizMap.lizmapLayerFilterActive = null;
            $(this).hide();

            return false;
        });

    },
    'lizmapswitcheritemselected': function(evt){

        // Get item properties
        var itemConfig = null;
        var itemName = '';
        var itemType = evt.type;
        var itemSelected = evt.selected;

        // Get item Lizmap config
        var layerName = lizMap.getLayerNameByCleanName( evt.name );
        if( layerName ){
            itemName = layerName;
            itemConfig = lizMap.config.layers[layerName];
        }
        else{
            return false;
        }

        // Change action buttons values
        var btValue = itemName;
        if( !itemSelected )
            btValue = '';
        $('#switcher-layers-actions button').val( btValue );

        // Toggle buttons depending on itemType

        // Metadata
        $('#layerActionMetadata').attr( 'disable', !itemSelected ).toggleClass( 'disabled', !itemSelected );

        // Zoom to layer
        $('#layerActionZoom').attr( 'disable', (itemType == 'group' || !itemSelected) || !('extent' in itemConfig) ).toggleClass( 'disabled', (itemType == 'group' || !itemSelected || !('extent' in itemConfig) ) );

        // Export layer
        // Only if layer is in attribute table
        var showExport = false;
        if(
            itemType == 'layer'
            && itemSelected
            && 'attributeLayers' in lizMap.config
            && itemName in lizMap.config.attributeLayers
            && itemConfig['geometryType'] != 'none'
            && itemConfig['geometryType'] != 'unknown'
        ){
            showExport = true;
        }
        $('#layerActionExport').attr( 'disable', !showExport ).toggleClass( 'disabled', !showExport );


        // Layer style
        // Only if layer has styles defined
        var showStyles = false;
        var styleHtml = '';
        if(
            itemType == 'layer'
            && itemSelected
            && 'styles' in itemConfig
        ){
            showStyles = true;
            for( var st in itemConfig.styles ){
                styleHtml += '<li><a href="#" class="btn-style-layer">'+itemConfig.styles[st]+'</a></li>';
            }
        }
        $('#layerActionStyle').next('ul:first').html( styleHtml );
        onStyleSelection(showStyles);
        $('#layerActionStyle').attr( 'disable', !showStyles ).toggleClass( 'disabled', !showStyles );



        // Refresh sub-dock content
        if( $('#sub-dock .sub-metadata').length ){
            if( itemSelected ){
                var html = getLayerMetadataHtml( itemName );
                fillSubDock( html );
            }else{
                $('#sub-dock').hide();
            }
        }

    }

    });

}();
