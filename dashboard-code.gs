function generateATL(){
  generateForms("ATL")
}

function generateReports(){
  generateForms("grades")
}

function getDashboardData(){

  var data = [];
  
  var dashboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dashboard").getRange("C4:C6").getValues(); 
  var class = dashboard[0][0]; // Grabs which class we'll be generating reports for
  data.push(class);
  data.push(dashboard[1][0]); // Grabs which semester or school year
  
  // Calculate last row in sheet, then figure out how many students based on that
  var classSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(class);
  data.push(classSheet.getRange("C8:C").getValues().filter(String).length); // Number of SUBJECTS in given class
  var studentNum = classSheet.getRange("F8:F").getValues().filter(String).length; // Number of STUDENTS in given class
  data.push(studentNum); 
  
  var urls = classSheet.getRange("C1:C5").getValues(); // Creates an array of all the urls listed
  
  data.push(urls[0][0]); // ATL form url
  data.push(urls[1][0]); // ATL report url
  data.push(urls[3][0]); // sem report form url
  data.push(urls[4][0]); // sem reports url

  data.push(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(class).getRange(8, 6, studentNum, 2).getValues()); // List of student
  data.push(dashboard[2][0]); // Set szkola, so if it's gim or liceum
  return data;
  
  // returns array with data in following order: 
  // 0 fileId, 1 class, 2 semester, 3 num of subjects, 4 num of students, 5 ATL form url, 6 ATL report url, 7 sem report form url, 8 sem reports url, 9 szkola
}

function ifExistingForm(formUrl, name, class, period) {
  
  // Assign variables according to what form will be processed
  var row;
  var formId;
  var title;
  switch(name){
    case "teachers' ATL forms":
      row = 1;
      formId = "1MpYljsJzVUQqk9pbSkWGc5zMpIgbp0jOfSN6v1kj0PE";
      title = "Formularz ATL dla " + class + ", " + period;
      break;
      
    case "teachers' grade forms":
      row = 4;
      formId = "1UlzTtH0axYjPzOC4bq-tqiEfPH14TVQ_gapitNK-rds";
      title = "Formularz ocen semestralnych dla " + class + ", " + period;
      break;
      
    case "ATL reports":
      row = 2;
      formId = "12Eqs4aowrkSuinJJQuMkDbk1OnRwOTGdz9rOcoDGCqY";
      title = "Raporty ATL dla " + class + ", " + period;
      break;
      
    case "report cards":
      row = 5;
      formId = "1AFfYAo8pY5-naIPUrkjDoJUoFBDz3fXySvp9_QLh11M";
      title = "Raporty ocen semestralnych dla " + class + ", " + period;
      break;      
  }
  
    if(formUrl!="") {
      
      var ui = SpreadsheetApp.getUi();
      var response = ui.alert('Confirm', 'Generating ' + name + ' ' + class + ', ' + period + ' will overwrite the existing document. \nAre you sure you want to continue?', ui.ButtonSet.YES_NO);
      
      // Process the user's response.
      if (response == ui.Button.NO) { return; }
      
      // Destroy the old form

      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(class).getRange(row, 3).setValue("");
      DriveApp.getFileById(SpreadsheetApp.openByUrl(formUrl).getId()).setTrashed(true);
    }

  var thisFile = DriveApp.getFileById(SpreadsheetApp.getActive().getId());
  var parentFolder = DriveApp.getFolderById(thisFile.getParents().next().getId());
  var folders = parentFolder.getFolders(); //gets all the child folders
  var folderExists = false; // lets assume that the folder isn't there
  var folder; // used below
  var folderName = "SemReports, " + period;
  var targetFolder;
  var targetFile; // Because Google Scripts makes a distinction between a "file" and a "spreadsheet" object
  
  while (folders.hasNext() && !folderExists) { //loop through the list of folders to check if it's there
    folder = folders.next();
    if(folder.getName()==folderName) {  // if the folder is there, then set the var to TRUE, set it as target folder
      folderExists = true;
      targetFolder = folder; 
    }
 }
  
  if(!folderExists) { // if the folder doesn't already exists, then make a new one in the same folder as the report generator
      targetFolder = parentFolder.createFolder("SemReports, " + period);
  }
  
  var targetSheet = SpreadsheetApp.openById(formId).copy(title);
  targetFile = DriveApp.getFileById(targetSheet.getId());
  targetFolder.addFile(targetFile); // adds file to the target folder
  DriveApp.removeFile(targetFile); // removes listing from the root directory
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(class).getRange(row, 3).setValue(targetSheet.getUrl()); // set new URL
  
  return targetSheet;
}


function generateForms(type) {
  
  var dashboard = getDashboardData();
  
  var class = dashboard[0];
  var period = dashboard[1];
  var subjectNum = dashboard[2];
  var studentNum = dashboard[3];
  var atlFormUrl = dashboard[4];
  var atlReportUrl = dashboard[5];
  var semFormUrl = dashboard[6];
  var semReportUrl = dashboard[7];
  var studentList = dashboard[8];
  var szkola = dashboard[9];
  
  // Run function to check ff there already is an existing form, ask if it should be destoryed and make a new one
  
  if(type=="ATL") {
    var targetSheet = ifExistingForm(atlFormUrl, "teachers' ATL forms", class, period);
  } 
  else if(type=="grades") {
    var targetSheet = ifExistingForm(semFormUrl, "teachers' grade forms", class, period);
  }
    
  // Gather data and define key variables

  var subjectTable = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(class).getRange(8, 2, subjectNum, 3).getValues();
  var templateSheet = targetSheet.getSheetByName("Template");
  var currentSheet;
  var subject;
  var subjectGroup;
  var teacher;
  var subjectShort;
  
  // Prep templateSheet for duplication
  templateSheet.getRange(12, 1, studentNum, 2).setValues(studentList); // Set student names
  
  if(type=="ATL"){
    
    templateSheet.getRange("C4").setValue(period); // Set the period for the reports
    templateSheet.getRange(12, 1, studentNum, 2).setBackground(templateSheet.getRange(10, 1).getBackground()); // Set color to that of header
    var formatRange = templateSheet.getRange(12, 1, studentNum, 6); // Set variable useful for clean up later
    formatRange.setBorder(true, true, true, true, true, true); // Set borders
    templateSheet.getRange(12, 3, studentNum, 4).setDataValidation(templateSheet.getRange(12, 3).getDataValidation()); // Set validation rule across entire table
    templateSheet.getRange(12, 3, studentNum, 4).setBackground(templateSheet.getRange(11, 3).getBackground()); // Set color to that of header
    
    var subGroupRng = "D5";
    var subjectRng = "D6";
    var teacherRng = "D7";


  } else if (type=="grades") {
  
    templateSheet.getRange(4, 3).setValue(period); // Set the period for the reports
    var ruleMYP = templateSheet.getRange(12, 3).getDataValidation(); // Grab data validation for MYP marks 
    var mypMarks = "=if(R[0]C[-1]=\"\", \"\", mypMark(R[0]C[-4],R[0]C[-3],R[0]C[-2],R[0]C[-1]))";
    var plConvert = "=if(R[0]C[-1]=\"\",\"\", percentToMYP(R[0]C[-1]," + szkola + "))";
    var plMarks = "=if(R[0]C[-1]=\"\", \"\", polishMark(R[0]C[-6],R[0]C[-5],R[0]C[-4],R[0]C[-3],R[0]C[-1]," + szkola + "))";
    templateSheet.getRange(12, 1, studentNum, 2).setBackground(templateSheet.getRange(11, 1).getBackground()); // Set color to that of header
    var formatRange = templateSheet.getRange(12, 1, studentNum, 10); // Set variable useful for clean up later
    formatRange.setBorder(true, true, true, true, true, true); // Set borders
    templateSheet.getRange(12, 3, studentNum, 10).setHorizontalAlignment("center"); // Align criteria and marks to be centered
    templateSheet.autoResizeColumn(2); // Resize column so that no student names are cut off
    templateSheet.getRange(12, 3, studentNum, 4).setDataValidation(ruleMYP); // Set validation rule across A-D
    templateSheet.getRange(12, 9, studentNum, 1).setDataValidation(ruleMYP); // Set validation rule for P
    templateSheet.getRange(12, 3, studentNum, 5).setBackground(templateSheet.getRange(11, 3).getBackground()); // Set color of MYP section to that of header
    templateSheet.getRange(12, 8, studentNum, 3).setBackground(templateSheet.getRange(11, 8).getBackground()); // Set color of PL section to that of header
    templateSheet.getRange(12, 8, studentNum, 1).setNumberFormat(templateSheet.getRange(12, 8).getNumberFormat()); // Set number format to %
    templateSheet.getRange(12, 7, studentNum, 1).setFormula(mypMarks); // Set MYP marks formula for entire column
    templateSheet.getRange(12, 9, studentNum, 1).setFormula(plConvert); // Set PL convert formula for entire column
    templateSheet.getRange(12, 10, studentNum, 1).setFormula(plMarks); // Set PL marks formula for entire column
    
    var subGroupRng = "C1";
    var subjectRng = "C2";
    var teacherRng = "C3";
  
  }
  
  SpreadsheetApp.flush();  // Make sure template is updated before proceeding
  
  // Duplicate and populate sheets
  for(var i=0; i < subjectNum; i++) {

    subject = subjectTable[i][1];
    subjectGroup = subjectTable[i][0];
    teacher = subjectTable[i][2];
    
    // Create a short name for a subject if it's more than one word long
    if(subject.indexOf(" ")==-1) { subjectShort = subject; }
    else if(subject=="Wychowanie fizyczne") { subjectShort = "WF"; }
    else if(subject=="Wiedza o Społeczeństwie") { subjectShort = "WOS"; }
    else if(subject=="Zajęcia techniczne") { subjectShort = "technika"; }
    else { subjectShort = subject.substring(subject.indexOf(" ")+1); } // This final line is for languages
    
    
    currentSheet = templateSheet.copyTo(targetSheet);
    currentSheet.setName(teacher.substring(teacher.indexOf(" ")+1)+"-"+subjectShort);
    currentSheet.getRange(subGroupRng).setValue(subjectGroup);
    currentSheet.getRange(subjectRng).setValue(subject);
    currentSheet.getRange(teacherRng).setValue(teacher);
    

  }
  
  targetSheet.deleteSheet(targetSheet.getSheetByName("Template")); // Delete unneeded sheet
 
  
}

function compileATL() {
  var dashboard = getDashboardData();
  
  var class = dashboard[0];
  var period = dashboard[1];
  var subjectNum = dashboard[2];
  var studentNum = dashboard[3];
  var atlFormUrl = dashboard[4];
  var atlReportUrl = dashboard[5];
  var semFormUrl = dashboard[6];
  var semReportUrl = dashboard[7];
  var studentList = dashboard[8];
  var currentSheet; // A useful variable for switching between sheets later on
  
  var finishedReports = ifExistingForm(atlReportUrl, "ATL reports", class, period);
  var reportForms = SpreadsheetApp.openByUrl(atlFormUrl).getSheets();   // Gets the spreadsheet with the source data on it, i.e. the grade forms
  var templateSheet = finishedReports.getSheetByName("Template"); // Select the Template sheet within the spreadsheet
  templateSheet.getRange("G1").setValue("Okres: " + period);
  
  SpreadsheetApp.flush();  // Update the memory before moving forward



  
  // Prep template for formating transfer
  
  var formatRange = templateSheet.getRange(2, 2, 4, 6); // Copy the range that'll be duplicating
  
  // For showign the scale at the end of the document
  var scale = [["Skala:"],["często"],["z reguły"],["czasami"],["rzadko"],["nie dotyczy"]];
  var scaleBox;
  
  // Create an array of objects, each object being the entire data table plus subject and teacher
  
  var eachReport = {}; // An empty object
  var reportData = []; // An array to store objects in
  
  // This loop moves all the data out of spreadsheets into arrays where it's easier to work with
  for(var i=0; reportForms.length > i; i++) {
    eachReport = {}; // Reset the object to blank
    
    eachReport.table = reportForms[i].getRange(12, 3, studentNum, 4).getValues(); // Move the entire grading data into a table
    eachReport.subject = reportForms[i].getRange(6, 4).getValue(); // Gets the subject
    eachReport.teacher = reportForms[i].getRange(7, 4).getValue(); // Gets the teacher's name
    eachReport.desc = reportForms[i].getRange(5, 6).getValue(); // Gets description of ATLs chosen by teacher
    eachReport.ATLs = reportForms[i].getRange(11, 3, 1, 4).getValues(); // Gets the teacher's ATLs
    reportData.push(eachReport); // Add the report to the array of reports
  }
  
  // At the end of the loop, you now have an array of eachReport objects, one for every teacher
  // Now, we should go through the raw data, and build a table array with scores for each student
  
  
  var student;  // variable for student name
  var report = {}; // object for student reports
  var tempTable;
  var rowCount = 2; // keeps track of which row is being generated. Data starts to get placed on row 2

  
  for(var i=0; studentList.length > i; i++) {
    
    if (studentList[i][1]=="") {
      student = studentList[i][0]; // Get the number of the student
    } else {
      student = studentList[i][0] + " " + studentList[i][1];
    }
    
    rowCount = 2; // Reset row counter for every student
    
   
    
    currentSheet = finishedReports.getSheetByName(student);  // Is this bit of code needed anymore? 
    if(currentSheet == null) {
      //if it doesn't exist, make it
 
      currentSheet = templateSheet.copyTo(finishedReports);
      currentSheet.setName(student);
      currentSheet.getRange(1, 2).setValue("Uczeń nr " + student);
      currentSheet.getRange(1,6).setValue("Klasa: " + class);
    }
    
    for(var j=0; reportData.length > j; j++) {
      
      report = {}; // Reset the report object
      
      
      // if there is data on the student, the report will be generated
      if (reportData[j].table[i][0]!="") {
        
        // Data on teacher and subject
        report.teacher = reportData[j].teacher;
        report.subject = reportData[j].subject;
        // report.desciptRows = 21+((report.description.length)/120)*21; // Calculates the height for the row with description, standard row height is 21
        
        // Check to see how many ATLs the teacher used and then save the values appropriately
        var countATL = 0; // keeps track of how many ATLs a given teacher has chosen to use
        
        for(var k=0; k < 4; k++){
          if(reportData[j].ATLs[0][k] === "" || reportData[j].ATLs[0][k] === "[wpisać ATL tutaj]") {
            
          } else { countATL++; }
          
        }
        
        // Record only meaningful data
        if(countATL >= 1) {
          report.ATL1 = reportData[j].ATLs[0][0];
          report.eval1= reportData[j].table[i][0];
        }
        if(countATL >=2) {
          report.ATL2 = reportData[j].ATLs[0][1];
          report.eval2 = reportData[j].table[i][1];        
        }
        if(countATL >=3) {
          report.ATL3 = reportData[j].ATLs[0][2];
          report.eval3 = reportData[j].table[i][2];
        }
        if(countATL == 4) {
          report.ATL4 = reportData[j].ATLs[0][3];
          report.eval4 = reportData[j].table[i][3];
        }      
        
        
          report.desc = reportData[j].desc
        
        // Set the values on the table according to how many ATLs there are
        
        if(countATL == 4) {

          tempTable = [["Nauczyciel: " + report.teacher, "", "Przedmiot: " + report.subject, "", "Informacja o ATL od nauczyciela", ""], 
                       [report.ATL1, report.ATL2, report.ATL3, report.ATL4, report.desc, ""],
                       [report.eval1, report.eval2, report.eval3, report.eval4, "", ""]];
          
          formatRange.copyTo(currentSheet.getRange(rowCount,2)); 
          currentSheet.getRange(rowCount, 2, 3, 6).setValues(tempTable);
          currentSheet.setRowHeight(rowCount+3, 5); // set height of dividing row
          currentSheet.getRange(rowCount+3, 2, 1, 6).setBackground("#666666");

          // Make sure comments are visible in last column
          if((report.desc.length)/3.3 > 42) {
            var height = report.desc.length/3.3 - currentSheet.getRowHeight(rowCount+1);
            currentSheet.setRowHeight(rowCount+2, height);
          }
            
          rowCount = rowCount + 4;
          
        } else if(countATL == 3) {
          
          tempTable = [["Nauczyciel: " + report.teacher, "", "Przedmiot: " + report.subject, "", "Informacja o ATL od nauczyciela", ""], 
                       [report.ATL1, report.ATL2, report.ATL3, "", report.desc, ""],
                       [report.eval1, report.eval2, report.eval3, "", "", ""]];

          // format the table
          formatRange.copyTo(currentSheet.getRange(rowCount,2)); 
          currentSheet.getRange(rowCount, 2, 3, 6).setValues(tempTable);
          currentSheet.setRowHeight(rowCount+3, 5); // set height of dividing row
          currentSheet.getRange(rowCount+3, 2, 1, 6).setBackground("#666666");
          
          // Merge the appropriate cells
          currentSheet.getRange(rowCount+1, 4, 1, 2).mergeAcross();
          currentSheet.getRange(rowCount+2, 4, 1, 2).mergeAcross();

          // Make sure comments are visible in last column
          if((report.desc.length)/3.3 > 42) {
            var height = report.desc.length/3.3 - currentSheet.getRowHeight(rowCount+1);
            currentSheet.setRowHeight(rowCount+2, height);
          }
            
          //Increment
          rowCount = rowCount + 4;
          
        } else if(countATL == 2) {
          
          //Place data in spreadsheet
          tempTable = [["Nauczyciel: " + report.teacher, "", "Przedmiot: " + report.subject, "", "Informacja o ATL od nauczyciela", ""], 
                       [report.ATL1, "", report.ATL2, "", report.desc, ""],
                       [report.eval1, "", report.eval2, "", "", ""]];  
          
          // format the table
          formatRange.copyTo(currentSheet.getRange(rowCount,2)); 
          currentSheet.getRange(rowCount, 2, 3, 6).setValues(tempTable);
          currentSheet.setRowHeight(rowCount+3, 5); // set height of dividing row
          currentSheet.getRange(rowCount+3, 2, 1, 6).setBackground("#666666");
          
          // Merge the appropriate cells
          currentSheet.getRange(rowCount+1, 2, 1, 2).mergeAcross();
          currentSheet.getRange(rowCount+2, 2, 1, 2).mergeAcross();
          currentSheet.getRange(rowCount+1, 4, 1, 2).mergeAcross();
          currentSheet.getRange(rowCount+2, 4, 1, 2).mergeAcross();

          // Make sure comments are visible in last column
          if((report.desc.length)/3.3 > 42) {
            var height = report.desc.length/3.3 - currentSheet.getRowHeight(rowCount+1);
            currentSheet.setRowHeight(rowCount+2, height);
          }
          
          //Increment
          rowCount = rowCount + 4;
          
        } else if(countATL == 1) {
          tempTable = [["Nauczyciel: " + report.teacher, "", "Przedmiot: " + report.subject, "", "Informacja o ATL od nauczyciela", ""], 
                       [report.ATL1, "", "", "", report.desc, ""],
                       [report.eval1, "", "", "", "", ""]];
          
                    // format the table
          formatRange.copyTo(currentSheet.getRange(rowCount,2)); 
          currentSheet.getRange(rowCount, 2, 3, 6).setValues(tempTable);
          currentSheet.setRowHeight(rowCount+3, 5); // set height of dividing row
          currentSheet.getRange(rowCount+3, 2, 1, 6).setBackground("#666666");
          
          // Merge the appropriate cells
          currentSheet.getRange(rowCount+1, 2, 1, 4).mergeAcross();
          currentSheet.getRange(rowCount+2, 2, 1, 4).mergeAcross();
          
          // Make sure comments are visible in last column
          if((report.desc.length)/3.3 > 42) {
            var height = report.desc.length/3.3 - currentSheet.getRowHeight(rowCount+1);
            currentSheet.setRowHeight(rowCount+2, height);
          }
          
          //Increment
          rowCount = rowCount + 4;
          
        } 
      }  // end of j count
      
    } // end of i count
    
    
          // Final formatting before moving onto next student's sheet
      scaleBox = currentSheet.getRange(currentSheet.getLastRow()+3, 4, 6, 1);
      scaleBox.setValues(scale);
      scaleBox.setHorizontalAlignments([["center"],["center"],["center"],["center"],["center"],["center"]]);
      scaleBox.setVerticalAlignment([["middle"],["middle"],["middle"],["middle"],["middle"],["middle"]]);
      scaleBox.setBorder(true, true, true, true, true, true);
      scaleBox.setBackground("#E8E8EE");
      scaleBox.setFontSizes([[14],[12],[12],[12],[12],[12]]);


  }
  
  finishedReports.deleteSheet(finishedReports.getSheetByName("Template"));


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



function shortenName(name) {
  
  var nameArray = name.split(" ");
  var firstName = nameArray[1];
  var surname = nameArray[0];
  
  return firstName + " " + surname;
  
  
}

function compileReports() {

  var dashboard = getDashboardData();
  
  var class = dashboard[0];
  var period = dashboard[1];
  var subjectNum = dashboard[2];
  var studentNum = dashboard[3];
  var atlFormUrl = dashboard[4];
  var atlReportUrl = dashboard[5];
  var semFormUrl = dashboard[6];
  var semReportUrl = dashboard[7];
  var studentList = dashboard[8];
  var currentSheet; // A useful variable for switching between sheets later on
  
  var finishedReports = ifExistingForm(semReportUrl, "report cards", class, period);
  var reportForms = SpreadsheetApp.openByUrl(semFormUrl).getSheets();   // Gets the spreadsheet with the source data on it, i.e. the grade forms
  var templateSheet = finishedReports.getSheetByName("Template"); // Select the Template sheet within the spreadsheet
  
  SpreadsheetApp.flush();  // Update the memory before moving forward


  
  // Prep template for formating transfer
  var formatRange = templateSheet.getRange(3, 2, 5, 9); // Copy the range that'll be duplicating
  
  
  
  // Create an array of objects, each object being the entire data table plus subject and teacher
  
  var eachReport = {}; // An empty object
  var reportData = []; // An array to store objects in
  
  // This loop moves all the data out of spreadsheets into arrays where it's easier to work with
  for(var i=0; reportForms.length > i; i++) {
    eachReport = {}; // Reset the object to blank
    
    eachReport.table = reportForms[i].getRange(12, 3, studentNum, 8).getValues(); // Move the entire grading data into a table
    eachReport.subject = reportForms[i].getRange(2, 3).getValue(); // Gets the subject
    eachReport.teacher = reportForms[i].getRange(3, 3).getValue(); // Gets the teacher's name
    eachReport.description = reportForms[i].getRange(2, 6, 7, 1).getValues(); // Gets descriptors of the criteria and concepts, contexts used
    eachReport.summary = reportForms[i].getRange("B6").getValue(); // Gets the summary of the semester
    reportData.push(eachReport); // Add the report to the array of reports
  }
  
  // At the end of the loop, you now have an array of eachReport objects, one for every teacher
  // Now, we should go through the raw data, and build a table array with scores for each student
  
  
  var student;  // variable for student name
  var report = {}; // object for student reports
  var tempTable = templateSheet.getRange(2, 2, 9, 5).getValues();
  var rowCount = 2; // keeps track of which row is being generated. Data starts to get placed on row 2
 
  
  
  for(var i=0; studentList.length > i; i++) {
    
    
    if (studentList[i][1]=="") {
      student = studentList[i][0]; // Get the number of the student
    } else {
      student = studentList[i][0] + " " + studentList[i][1];
    }
    rowCount = 2; // Reset row counter for every student
   
 
    currentSheet = templateSheet.copyTo(finishedReports);
    currentSheet.getRange(1, 4).setValue("Uczeń nr " + student + ", Klasa: " + class + ", Okres: " + period);
    currentSheet.setName(student);
    
    
    for(var j=0; reportData.length > j; j++) {
      
      
      
      // if there is data on the student, the report will be generated
      if (reportData[j].table[i][0]!="") {
        report.teacher = reportData[j].teacher;
        report.subject = reportData[j].subject;
        report.descA= reportData[j].description[0][0];
        report.descB= reportData[j].description[1][0];
        report.descC= reportData[j].description[2][0];
        report.descD= reportData[j].description[3][0];
        report.descP= reportData[j].description[4][0];
        report.concepts= reportData[j].description[5][0];
        report.contexts= reportData[j].description[6][0];
        report.summary= reportData[j].summary;
       // report.desciptRows = 21+((report.description.length)/120)*21; // Calculates the height for the row with description, standard row height is 21
        report.a = reportData[j].table[i][0];
        report.b = reportData[j].table[i][1];
        report.c = reportData[j].table[i][2];
        report.d = reportData[j].table[i][3];
        report.myp = reportData[j].table[i][4];
        // skip index 5 b/c it's the percentage
        report.p = reportData[j].table[i][6];
        report.pl = reportData[j].table[i][7];
        
   
        
        tempTable[0][0] = "Przedmiot: " + report.subject + ", Nauczyciel: " + report.teacher;
        
        tempTable[2] = ["Kryterium A", report.descA, report.a, report.myp, report.pl];
        tempTable[3] = ["Kryterium B", report.descB, report.b, "", ""];
        tempTable[4] = ["Kryterium C", report.descC, report.c, "", ""];
        tempTable[5] = ["Kryterium D", report.descD, report.d, "Opis semestru: \n" + report.summary, ""];
        tempTable[6] = ["Kryterium P", report.descP, report.p, "", ""];
        tempTable[7] = ["Koncepcje", report.concepts, "-", "", ""];
        tempTable[8] = ["Konteksty", report.contexts, "-", "", ""];

        
        currentSheet.getRange(rowCount, 2, 9, 5).setValues(tempTable);
        currentSheet.setRowHeight(rowCount+9, 5); // set height of dividing row
        currentSheet.getRange(rowCount+9, 2, 1, 5).setBackground("#666666");
        
        
        
        rowCount = rowCount + 10;
        
        
      }
      
        
    }
    
  // Final formatting before moving onto next student's sheet
//    currentSheet.setColumnWidth(3, 200);
    currentSheet.getRange(2, 2, 10, 5).copyFormatToRange(currentSheet, 2, 6, 12, currentSheet.getLastRow()+2);
  
    

  }
  
  finishedReports.deleteSheet(finishedReports.getSheetByName("Template"));

}

function combineReports() {
  
  var dashboard = getDashboardData();
  
  var class = dashboard[0];
  var period = dashboard[1];
  var subjectNum = dashboard[2];
  var studentNum = dashboard[3];
  var evalUrl = dashboard[5];
  var reportsUrl = dashboard[7];
  var studentList = dashboard[8];
  
  var classSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(class);  // Selects the sheet for the appropriate class
  var evalFileId = SpreadsheetApp.openByUrl(evalUrl).getId();
  var reportsFileId = SpreadsheetApp.openByUrl(reportsUrl).getId();
  var reportCards = SpreadsheetApp.openByUrl(reportsUrl).getSheets();   // Gets the spreadsheet with the source data on it, i.e. report cards
  var atlEvals = SpreadsheetApp.openByUrl(evalUrl).getSheets();  // Gets the spreadsheets with ATL evaluations
  var currentSheet; // A useful variable for switching between sheets later on
  var student;
  
  
  // Create directory to hold data
  
  var reportsFile = DriveApp.getFileById(reportsFileId);
  var reportsFolder = DriveApp.getFolderById(reportsFile.getParents().next().getId());
  var folders = reportsFolder.getFolders(); //gets all the child folders
  var folderExists = false;
  var folder; 
  var folderName = "Combined reports, " + class + ", " + period;
  var targetFolder;
  var targetFile; // Because Google Scripts makes a distinction between a "file" and a "spreadsheet" object
  
  while (folders.hasNext() && !folderExists) { //loop through the list of folders to check if it's there
    folder = folders.next();
    if(folder.getName()==folderName) {  // if the folder is there, then set the var to TRUE, set it as target folder
      folderExists = true;
      targetFolder = folder; 
    }
 }
  
  if(!folderExists) { // if the folder doesn't already exists, then make a new one in the same folder as the report generator
      targetFolder = reportsFolder.createFolder("Combined reports, " + class + ", " + period);
    
  }
    
    
  
  // Start looping through reports
  
  for(var i=0; i < studentNum; i++) {
    
    student = studentList[i][0]  // Student is identified by their number of the class register
    if(student<10) {
      student = "0" + student;
    }
    
    currentSheet = SpreadsheetApp.create(student); 
    targetFile = DriveApp.getFileById(currentSheet.getId());
    
    // Copy grade and ATL reports
    reportCards[i].copyTo(currentSheet).setName("Oceny");
    atlEvals[i].copyTo(currentSheet).setName("ATL");
    
    // Delete Sheet1
    currentSheet.deleteSheet(currentSheet.getSheetByName("Sheet1"));
    
    // Move file into the right folder
    targetFolder.addFile(targetFile); // adds file to the target folder
    DriveApp.removeFile(targetFile); // removes listing from the root directory

  }
  

  
  
}
