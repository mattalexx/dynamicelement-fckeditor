<?php

class Process {

	var $stdout;
	var $stderr;
	var $exit_code;

	function Process($command=null) {
		$this->_reset();
		if (!is_null($command)) {
			$this->execute($command);
		}
	}

	function execute($command) {

		// Reset myself
		$this->_reset();

		// Execute command
		$resource = proc_open($command, array(array('pipe', 'r'), array('pipe', 'w'), array('pipe', 'w')), $pipes, null, $_ENV);
		if (!is_resource($resource)) {
			return;
		}

		// Collect STDOUT
		while (!feof($pipes[1])) {
			$this->stdout .= fgets($pipes[1]);
		}
		fclose($pipes[1]);

		// Collect STDERR
		while (!feof($pipes[2])) {
			$this->stderr .= fgets($pipes[2]);
		}
		fclose($pipes[2]);

		// Collect exit code
		$this->exit_code = proc_close($resource);
	}

	function _reset() {
		$this->stdout = '';
		$this->stderr = '';
		$this->exit_code = '';
	}

}

$command = 'convert -fill \'#2276c0\' -font '.dirname(__FILE__).'/HelveticaLTStdCond.otf -pointsize 14 label:"'.strtoupper($_GET['text']).'" png:-';
$process = new Process($command);
header('Content-type: image/png');
print $process->stdout;
