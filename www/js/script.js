/* Author: Steven Campbell

*/


function showServerDownMessageIfNothingHappens(elementIdToCheck) {
	setTimeout(function() {
		var check = $('#' + elementIdToCheck).hasClass('hasData');
		if (!check) {
			$("#serviceDown").show();
		}
	}, 4000)
}

function showScriptsForDistro(distro) {
	var hidden = $('#allScripts');
	var scripts = JSON.parse(hidden.val());		

	var select = $('#amiScripts');
	select.addClass('hasData');
	select.html('');
	for(var i=0;i<scripts.length;i++) {
	
		if (scripts[i].indexOf(distro) == 0) {
			var option = '<option>' + scripts[i] + '</option>';
			select.append(option);
		}
	}
}


$(function(){
	prettyPrint();		//see http://google-code-prettify.googlecode.com/svn/trunk/README.html
	
	showServerDownMessageIfNothingHappens('region');
	showServerDownMessageIfNothingHappens('distro');

	amigen.callApi('scripts', function(err, data) {
		if (err)  return;
		
		var hidden = $('#allScripts');
		hidden.val(JSON.stringify(data.scripts));		//store for later

		var lastDistro = "";
		var select = $('#distro');
		select.addClass('hasData');
		for(var i=0;i<data.scripts.length;i++) {
			var distro = data.scripts[i].replace(/\\/g, "/").split("/")[0];
			if (distro != lastDistro) {
			
				var option = '<option ' + (distro=='ubuntu11.10' ? 'selected' : '') + '>' + distro + '</option>';
				select.append(option);
			
			}
			
			lastDistro = distro;
		}
		
		showScriptsForDistro('ubuntu11.10')
	});

	amigen.callApi('regions', function(err, data) {
		if (err)  return;
		
		var select = $('#region');
		select.addClass('hasData');
		for(var i=0;i<data.length;i++) {
		
			var option = '<option ' + (data[i]=='us-east-1' ? 'selected' : '') + '>' + data[i] + '</option>';
			select.append(option);
		}
	});
	
	$('#distro').change(function() {
		var distro = $('#distro').val();
		showScriptsForDistro(distro);
	})
	
	$('#btnCreate').click(function() {
		$('#imageSuccess').hide();
		$('#amiScriptsDiv').removeClass('error');
		
		var config = {};
		var selectedScripts = $('#amiScripts').val();
		if (!selectedScripts || selectedScripts.length==0) {
			$('#amiScriptsDiv').addClass('error');
			return;
		}
		config.scripts = selectedScripts;
		var region = $('#region');
		config.options = {};
		config.options.region = region.val();
		config.options.publish = true;
		
		if ($('#optionsRadios:checked').val()=="32bit") {
			config.options.bit32 = true;
			config.options.bit64 = false;
		}
		
		console.log(config);
		
		$('.pleaseWait').show();
		amigen.callApi('gen', config, function(err, result) {
			$('.pleaseWait').hide();
			if (err) return;
			
			$('#amiLink').text(result.ami);
			$('#amiLink').attr("href", "https://console.aws.amazon.com/ec2/home?region=" + result.region + "#launchAmi=" + result.ami);
			$('#imageSuccess').show();
		});
		
		return false;
	});
	
});

