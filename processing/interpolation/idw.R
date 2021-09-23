library('phylin')
library(compare)

stepSize <- 10

h3EmptyGridValues <- read.csv(file = '../dist/h3_center_7 copy.csv')
h3EmptyGridValuesNoValues <- subset(h3EmptyGridValues, !is.na(z))
startAt <- (nrow(h3EmptyGridValuesNoValues)/stepSize)+1
endAt <- startAt + 150
#emptyGrid <- data.frame(x = h3EmptyGridValues$x, y =  h3EmptyGridValues$y)



h3ExistingGridValues <- read.csv(file = '../dist/h3_data_7.csv')
valuedGrid <- data.frame(x = h3ExistingGridValues$lng, y =  h3ExistingGridValues$lat)
values <- h3ExistingGridValues$value

i <- 0
for (i in startAt:endAt) {
  print(startAt + i)
  testGrid <- h3EmptyGridValues[((i-1)*stepSize+1):(i*stepSize),]
  
  int <- idw(values = values, coords = valuedGrid, grid = testGrid, method = "Shepard")
  testGrid$z <- int$Z
  print(testGrid)
  
  write.table(testGrid, '../dist/h3_interpolated_data_7.csv', row.names = FALSE, col.names = !file.exists('../dist/h3_interpolated_data_7.csv'), sep = ",", append = TRUE)
  
  h3EmptyGridValues <- read.csv(file = '../dist/h3_center_7 copy.csv')
  overWrite = rbind(h3EmptyGridValues[0:((i-1)*stepSize),], testGrid)
  overWrite = rbind(overWrite, h3EmptyGridValues[(i*stepSize+1):nrow(h3EmptyGridValues),]);
  write.csv(overWrite, file = '../dist/h3_center_7 copy.csv', row.names = FALSE)
}


