function polishMark(A,B,C,D,P, szkola) {
  
  if(szkola=="gimnazjum") { //sets the grade boundaries for gimnazjum
  
    var plGrade40 =    [["nie dostateczny", 0, 11],
                        ["dopuszacący", 12, 19],
                        ["dostateczny", 20, 27],
                        ["dobry", 28, 33],
                        ["bardzo dobry", 34, 37],
                        ["celujący", 38, 40]];
    
    // These grade boundries are out of 32, in case the teacher's missing a criterion
    var plGrade32 =       [["nie dostateczny", 0, 9],
                           ["dopuszacący", 10, 15],
                           ["dostateczny", 16, 22],
                           ["dobry", 23, 26],
                           ["bardzo dobry", 27, 30],
                           ["celujący", 31, 32]];
    
    // These grade boundries are out of 24, in case the teacher's missing two criteria
    var plGrade24 =      [["nie dostateczny", 0, 6],
                          ["dopuszacący", 7, 11],
                          ["dostateczny", 12, 16],
                          ["dobry", 17, 19],
                          ["bardzo dobry", 20, 22],
                          ["celujący", 23, 24]];
  
    var plGrade16 = [["nie dostateczny", 0, 4],
                     ["dopuszacący", 5, 7],
                     ["dostateczny", 8, 10],
                     ["dobry", 11, 13],
                     ["bardzo dobry", 14, 14],
                     ["celujący", 15, 16]];
  
  }
  else {  //liceum grade boundries
    
    var plGrade40 =    [["nie dostateczny", 0, 15],
                        ["dopuszacący", 16, 21],
                        ["dostateczny", 22, 27],
                        ["dobry", 28, 33],
                        ["bardzo dobry", 34, 37],
                        ["celujący", 38, 40]];
    
    // These grade boundries are out of 32, in case the teacher's missing a criterion
    var plGrade32 =       [["nie dostateczny", 0, 12],
                           ["dopuszacący", 13, 17],
                           ["dostateczny", 18, 22],
                           ["dobry", 23, 26],
                           ["bardzo dobry", 27, 30],
                           ["celujący", 31, 32]];
    
    // These grade boundries are out of 24, in case the teacher's missing two criteria
    var plGrade24 =      [["nie dostateczny", 0, 9],
                          ["dopuszacący", 7, 12],
                          ["dostateczny", 12, 16],
                          ["dobry", 17, 19],
                          ["bardzo dobry", 20, 22],
                          ["celujący", 23, 24]];
    
    var plGrade16 = [["nie dostateczny", 0, 5],
                     ["dopuszacący", 6, 8],
                     ["dostateczny", 9, 10],
                     ["dobry", 11, 13],
                     ["bardzo dobry", 14, 14],
                     ["celujący", 15, 16]];
    

    
  }
  
  
  

  
  var brak = "brak"; // String used to designate missing mark 
  var numOfCriteria = 0; // Used to count the number of criteria entered.
  var points = 0; // Total points given by teacher
  

  
  // Counting up how many criteria have been given by the teacher and the total points awarded
  if(A!=brak) { numOfCriteria++; points = points + A; }
  if(B!=brak) { numOfCriteria++; points = points + B; }
  if(C!=brak) { numOfCriteria++; points = points + C; }
  if(D!=brak) { numOfCriteria++; points = points + D; }
  if(P!=brak) { numOfCriteria++; points = points + P; }
  

  
  var plGradeBndrs; // Used to defy which grade boundry tables will be used.
  
  // Choosing which grade table to use
  if(numOfCriteria==5) { plGradeBndrs = plGrade40; }
  else if(numOfCriteria==4) { plGradeBndrs = plGrade32; }
  else if(numOfCriteria==3) { plGradeBndrs = plGrade24; }
  else if(numOfCriteria==2) { plGradeBndrs = plGrade16; }
  
  // Selecting the grades and returning result
  for(var i=0; i < plGradeBndrs.length; i++) {
    if(points >= plGradeBndrs[i][1] && points <= plGradeBndrs[i][2]) return plGradeBndrs[i][0];  
  }



}


function mypMark(A,B,C,D) {
  
  
  var ibGradeBndrs32 = [[1, 0, 5],
                        [2, 6, 9],
                        [3, 10, 14],
                        [4, 15, 18],
                        [5, 19, 23],
                        [6, 24, 27],
                        [7, 28, 32]];
  
  // These grade boundries are out of 24, in case the teacher's missing a criterion
  var ibGradeBndrs24 =  [[1, 0, 4],   
                         [2, 5, 7],
                         [3, 8, 10],
                         [4, 11, 13],
                         [5, 14, 17],
                         [6, 18, 20],
                         [7, 21, 24]];
  
  var ibGradeBndrs16 =  [[1, 0, 2],   
                         [2, 3, 4],
                         [3, 5, 7],
                         [4, 8, 9],
                         [5, 10, 11],
                         [6, 12, 13],
                         [7, 14, 16]];
  
  var ibGradeBndrs8 =  [[1, 0, 1],   
                        [2, 2, 2],
                        [3, 3, 3],
                        [4, 4, 4],
                        [5, 5, 5],
                        [6, 6, 6],
                        [7, 7, 8]];

  
  
  var brak = "brak"; // String used to designate missing mark 
  var numOfCriteria = 0; // Used to count the number of criteria entered.
  var points = 0; // Total points given by teacher
  
  // Counting up how many criteria have been given by the teacher and the total points awarded
  if(A!=brak) { numOfCriteria++; points = points + A; }
  if(B!=brak) { numOfCriteria++; points = points + B; }
  if(C!=brak) { numOfCriteria++; points = points + C; }
  if(D!=brak) { numOfCriteria++; points = points + D; }
  
  var ibGradeBndrs; // Used to defy which grade boundry tables will be used.
  
  // Choosing which grade table to use
  if(numOfCriteria==4) { ibGradeBndrs = ibGradeBndrs32; }
  else if(numOfCriteria==3) { ibGradeBndrs = ibGradeBndrs24; }
  else if(numOfCriteria==2) { ibGradeBndrs = ibGradeBndrs16; }
  
  // Selecting the grades and returning result
  for(var i=0; i < ibGradeBndrs.length; i++) {
    if(points >= ibGradeBndrs[i][1] && points <= ibGradeBndrs[i][2]) return ibGradeBndrs[i][0];  
  }

}


function percentToMYP(percent, szkola) {

  
    // percentages for conversion of criterion P into 0-8 scale
  
  
  if(szkola=="gimnazjum") {
    var critP = [[0, 0, .09],
                 [1, .10, .23],
                 [2, .24, .34],
                 [3, .35, .49],
                 [4, .50, .61],
                 [5, .62, .71],
                 [6, .72, .83],
                 [7, .84, .95],
                 [8, .96, 1]];
  }
  else { //takie same jak gim, mozna zmienic w razie potrzeby
    var critP = [[0, 0, .09],
                 [1, .10, .23],
                 [2, .24, .34],
                 [3, .35, .49],
                 [4, .50, .61],
                 [5, .62, .71],
                 [6, .72, .83],
                 [7, .84, .95],
                 [8, .96, 1]];    
    
  }
  
  
  
  var P=0; // result
  
    if(percent!="") {
      for(var i=0; i < 10; i++){
        if(percent >= critP[i][1] && percent <= critP[i][2]) {
          return critP[i][0];
        }
      }
    }
  else { return; }
  
  
  
}
function subjectGroups(subject) {
  
  switch(subject) {
    case "Język polski":
      return "Język i literatura";
      break;
      
    case "Język angielski":
    case "Język francuski":
    case "Język niemiecki":
    case "Język hiszpański":
      return "Nauka języka";
      break;
      
    case "Geografia":
    case "Historia":
    case "Wiedza o Społeczeństwie":
      return "Jednostki i społeczeństwa";
      
    case "Matematyka":
      return "Matematyka";
      break;
      
    case "Zajęcia techniczne":
    case "Informatyka":
      return "Projektowanie";
      break;
      
    case "Muzyka":
    case "Plastyka":
    case "Drama":
      return "Sztuka";
      break;
      
    case "Biologia":
    case "Chemia":
    case "Fizyka":
      return "Nauki przyrodnicze";
      break;
      
    case "Wychowanie fizyczne":
      return "Wychowanie fizyczne i zdrowotne";
      break;

      
      
  }

}
