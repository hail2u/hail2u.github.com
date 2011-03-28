#!/usr/local/bin/perl

use strict;

require "ufyu";

print &ufyu::markup_blocklevel(join '', <STDIN>);

exit;
