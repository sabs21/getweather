<?php
  // Imports city list.
  $json_data = file_get_contents("US_city_list_complete_fixed.json");
  $US_cities = json_decode($json_data);
  $US_cities_length = 19971;

  $cityInput = cleanInput($_GET["cityInput"]);
  $stateInput = null;

  if (!empty($_GET["stateInput"]))
  {
    $stateInput = cleanInput($_GET["stateInput"]);

    if (strlen($stateInput) > 2)
    {
      $stateInput = substr($stateInput, 0, 2);
    }
  }


  /*
  To find suggestions quickly, a binary search is performed.
  Two strings are compared; The user input and some city name substring from US_cities.
  First, the beginning letters (index 0) of both the user input and city name are compared.
  If user input (or $inputArr[0]) is larger, then add the $diff(erence) to the $index by a rounded up ($US_cities_length / 4).
    Note: $diff(erence) keeps dividing itself by 2 after the first two strings are compared.
  Else if city name (or $indexed) is larger, then subtract $diff(erence) from the $index by a rounded up ($US_cities_length / 4).
  */

  // $resultArr will store all matches found.
  $resultArr = [];
  // $index is initially set as half of the US_cities_length,
  // but its used to keep track of which index in US_cities to search next.
  $index = round($US_cities_length / 2, 0, PHP_ROUND_HALF_UP);
  // The $diff(erence) governs how much to add or subtract from the current $index.
  $diff = round($US_cities_length / 2, 0, PHP_ROUND_HALF_UP);
  // $inputLength will be used to compare $cityInput length amount of letters.
  $inputLength = strlen(str_replace(" ", "", $cityInput));
  // $inputArr is an array of $cityInput characters. Spaces are removed here
  // instead of in cleanInput because the original spaces will be useful in
  // the search around the $anchor.
  $inputArr = str_split(str_replace(" ", "", $cityInput));
  // $direction governs whether to add or subtract the $diff(erence) from $index.
  // true = add; false = subtract.
  $direction = true;
  // The $done flag monitors whether the search for the first match is complete.
  // This initial search is where the binary search algorithm is used.
  $done = false;
  $oneLastLoop = false;

  // This while loop finds the first match. (Maybe it should simply find the first matches index)
  while (!$done)
  {
    // The $diff(erence) governs how much to add or subtract from the current $index.
    $diff = round($diff / 2, 0, PHP_ROUND_HALF_UP);
    // The json city name is made lowercase to promote expected results from ord().
    // Spaces are removed to ensure expected results.
    $indexed = cleanInput($US_cities[$index]->name, true);
    $indexed = str_split($indexed);
    // This flag montiors whether the first match was ever found.
    $matched = false;

    // This for loop checks to see if the user input matches the city name substring.
    for ($i = 0; $i < $inputLength; $i++)
    {
      // In certain cases, the indexed city length will be shorter than our input.
      // Since $i < $inputLength, we know that $inputArr[$i] can't ever be null.
      // This is why we only have to check to see if $indexed[$i] is defined.
      if (isset($indexed[$i]))
      {
        $inputCharCode = ord($inputArr[$i]);
        $indexedCharCode = ord($indexed[$i]);
        // Note: For some reason, I can't put the logical expression that's
        // in $spaces into the if statement condition itself without getting
        // unexpected results.

        $spaces = $inputCharCode === 32 && $indexedCharCode === 32;

        // This if statement filters out any spaces from both inputs.
        // Doing this avoids both unexpected results and suggestions
        // without spaces even if the user input contains a space.
        if (!$spaces)
        {
          // Note: ord() is the PHP equivalent of charCodeAt().
          if ($inputCharCode > $indexedCharCode)
          {
            $index += $diff;
            $i = $inputLength;
          }
          else if ($inputCharCode < $indexedCharCode)
          {
            $index -= $diff;
            $i = $inputLength;
          }

          // If every character compared matches, then $matched = true.
          if ($i == $inputLength - 1)
          {
            $matched = true;
            $oneLastLoop = false;
          }
        }
      }
      // Since input is longer than indexed, that means that input will surely
      // be ahead of the current index.
      else
      {
        $index += $diff;
        $i = $inputLength;
      }
    }


    // If $oneLastLoop is true, that means no matches have been found.
    if ($oneLastLoop)
    {
      $done = true;
    }

    if ($matched)
    {
      $done = true;
    }
    // If no matches have been found and $diff(erence) = 1, then the next
    // iteration will be the last possible iteration to find a matching
    // result. Therefore, toggle the $oneLastLoop flag.
    else if (!$matched && $diff == 1)
    {
      $oneLastLoop = true;
    }
  }

// I may be able to go simpler with this and just see if the substring
// $cityInput is anywhere within a cleaned input of $city.
  if ($matched)
  {
    // The $anchor will serve as the base point for exploring any other potential results.
    $anchor = $index;
    // The offset index relative to the anchor.
    // $anchor is subtracted by one in order to check the $anchor itself.
    $offset = $anchor - 1;
    // If the resultArr gets filled to the $limit, then set this flag to true.
    $filled = false;
    // This counter helps monitor when to switch $direction.
    $counter = 0;

    while (!$filled)
    {
      if ($direction)
      {
        $offset += 1;
      }
      else
      {
        $offset -= 1;
      }

      $noSpaceInput = str_replace(" ", "", $cityInput);

      // First, clean the input for expected results.
      $city = cleanInput($US_cities[$offset]->name, true);
      // Next, make the indexed city name as long as the $inputLength.
      // Note: For some reason, $inputLength must be added by 1
      // in order for all possible suggestions to appear.
      $city = substr($city, 0, strlen($noSpaceInput));

      // First, we check if both the user input and city name match without
      // spaces to ensure that the search doesn't end prematurely.
      if ($city === $noSpaceInput)
      {
        if ($stateInput !== null)
        {
          $state = cleanInput($US_cities[$offset]->state);
          if (strpos($state, $stateInput) === 0)
          {
            $resultArr[$counter] = $US_cities[$offset];
            $counter += 1;
          }
        }
        else
        {
          $resultArr[$counter] = $US_cities[$offset];
          $counter += 1;
        }
      }
      // This is an else if because the moment that two strings dont match,
      // there will never be another match in the current $direction. So we
      // must switch $direction.
      else if ($direction)
      {
        $direction = false;
        $offset = $anchor;
      }
      else
      {
        $filled = true;
        echo json_encode($resultArr);
      }
    }
  }
  // If an initial first match was not found, then return false.
  else
  {
    echo json_encode(false);
  }

  // $cleanSpaces is a boolean.
  function cleanInput($str, $cleanSpaces = false) {
    $input = strtolower($str);
    $first_char = substr($input, 0, 1);
    $last_char = substr($input, strlen($input) - 1, 1);
    //var_dump($last_char);

    // Checking for extra spaces or ' in front of the input.
    while ($first_char == " " || $first_char == "'")
    {
      $input = substr($input, 1, strlen($input));
      $first_char = substr($input, 0, 1);
    }

    // Checking for extra spaces or ' at the end of the input.
    while ($last_char == " " || $last_char == "'")
    {
      $input = substr($input, 0, strlen($input) - 1);
      $last_char = substr($input, strlen($input) - 1, 1);
    }

    if ($cleanSpaces)
    {
      $invalid = [" ", "-", "'"];
    }
    else
    {
      $invalid = ["-", "'"];
    }
    return str_replace($invalid, "", $input);
  }

  // I need this file to take an input (User typed input) for both City Name and State fields.
  // If this file receives an input singleCity = true,
  // Then output one single result from US_cities_list_complete.json.
  // Else if this file receives an input singleCity = false,
  // Then output a max of 10 results from US_cities_list_complete.json.
 ?>
