# Test script for plumber.R function
# Load required libraries
library(jsonlite)
library(readxl)
library(httr)
library(BioHEARTResilience)

# Source the utility function from plumber.R
`%||%` <- function(x, y) {
  if (is.null(x)) y else x
}

# Test function (extracted from plumber.R)
test_analysis <- function() {
  tryCatch(
    {
      # Read sample data directly (skip file download for testing)
      raw_data <- read.csv("/Users/matthewshu/Documents/GitHub-Projects/cad-x/sample_data.csv", stringsAsFactors = FALSE)
      
      # Mock column mappings
      column_mappings <- list(
        cacs = "cacs",
        age = "age", 
        gender = "gender",
        total_cholesterol = "total_cholesterol",
        hdl_cholesterol = "hdl_cholesterol",
        systolic_bp = "systolic_bp",
        smoking_status = "smoking_status",
        diabetes_status = "diabetes_status",
        bp_medication = "bp_medication",
        ethnicity = "ethnicity",
        subject_id = "subject_id"
      )
      
      # Mock settings
      settings <- list(
        risk_scores = c("frs", "ascvd"),
        risk_region = "Low",
        percentile_thresholds = list(
          resilient = 20,
          reference_low = 40,
          reference_high = 60,
          susceptible = 80
        ),
        min_scores = 1,
        ethnicity_mappings = NULL
      )
      
      cholesterol_unit <- "mg/dL"
      
      # Extract column names from mappings
      get_col_name <- function(field_name) {
        col <- column_mappings[[field_name]]
        if (is.null(col) || col == "") {
          return(NULL)
        }
        return(col)
      }

      # Prepare data using package function
      prepared_data <- prepare_cohort_data(
        data = raw_data,
        cacs_col = get_col_name("cacs"),
        age_col = get_col_name("age"),
        gender_col = get_col_name("gender"),
        tc_col = get_col_name("total_cholesterol"),
        hdl_col = get_col_name("hdl_cholesterol"),
        sbp_col = get_col_name("systolic_bp"),
        smoking_col = get_col_name("smoking_status"),
        diabetes_col = get_col_name("diabetes_status"),
        bp_med_col = get_col_name("bp_medication"),
        lipid_med_col = NULL,  # Not in sample data
        fh_ihd_col = NULL,     # Not in sample data
        ethnicity_col = get_col_name("ethnicity"),
        id_col = get_col_name("subject_id"),
        cholesterol_unit = cholesterol_unit,
        validate = TRUE
      )

      # Extract analysis settings
      risk_scores <- settings$risk_scores %||% c("frs", "ascvd")
      risk_region <- settings$risk_region %||% "Low"
      ethnicity_mappings <- settings$ethnicity_mappings

      # Extract percentile thresholds
      percentile_thresholds <- c(
        resilient = settings$percentile_thresholds$resilient %||% 20,
        reference_low = settings$percentile_thresholds$reference_low %||% 40,
        reference_high = settings$percentile_thresholds$reference_high %||% 60,
        susceptible = settings$percentile_thresholds$susceptible %||% 80
      )

      min_scores <- settings$min_scores %||% 1

      # Convert ethnicity mappings from frontend format to dataframe
      ethnicity_df <- NULL
      if (!is.null(ethnicity_mappings) && length(ethnicity_mappings) > 0) {
        ethnicity_df <- data.frame(
          original = names(ethnicity_mappings),
          ascvd = sapply(ethnicity_mappings, function(x) x$ascvd %||% "other"),
          mesa = sapply(ethnicity_mappings, function(x) x$mesa %||% "white"),
          stringsAsFactors = FALSE
        )
      }

      # Run the complete resilience analysis
      results <- resilience_analysis(
        data = prepared_data,
        risk_scores = risk_scores,
        risk_region = risk_region,
        percentile_thresholds = percentile_thresholds,
        min_scores = min_scores,
        include_plots = FALSE, # Don't generate plots
        ethnicity_mappings = ethnicity_df
      )

      # Generate summary statistics
      if ("classification" %in% names(results$final_data)) {
        classification_counts <- table(results$final_data$classification)
        classification_table <- setNames(as.numeric(classification_counts), names(classification_counts))
      } else {
        classification_table <- setNames(numeric(0), character(0))
      }

      summary_stats <- list(
        n_total = nrow(results$final_data),
        n_complete = sum(!is.na(results$final_data$average_normalized_score)),
        classifications = list(
          resilient = as.numeric(classification_table["Resilient"] %||% 0),
          reference = as.numeric(classification_table["Reference"] %||% 0),
          susceptible = as.numeric(classification_table["Susceptible"] %||% 0),
          other = as.numeric(classification_table["Other"] %||% 0)
        )
      )

      # Prepare results data matching TypeScript AnalysisResult format
      results_data <- results$final_data
      
      # Convert to list of records matching AnalysisResult type
      formatted_results <- list()
      for (i in seq_len(nrow(results_data))) {
        row <- results_data[i, ]
        
        # Extract risk scores (handle missing columns gracefully)
        risk_scores <- list()
        if ("frs" %in% names(row)) risk_scores$frs <- if (!is.na(row$frs)) as.numeric(row$frs)[1] else NULL
        if ("ascvd" %in% names(row)) risk_scores$ascvd <- if (!is.na(row$ascvd)) as.numeric(row$ascvd)[1] else NULL
        if ("mesa" %in% names(row)) risk_scores$mesa <- if (!is.na(row$mesa)) as.numeric(row$mesa)[1] else NULL
        if ("score2" %in% names(row)) risk_scores$score2 <- if (!is.na(row$score2)) as.numeric(row$score2)[1] else NULL
        
        formatted_results[[i]] <- list(
          subject_id = if ("subject_id" %in% names(row) && !is.na(row$subject_id)) as.character(row$subject_id)[1] else NULL,
          original_data = lapply(row[!names(row) %in% c("subject_id", "frs", "ascvd", "mesa", "score2", "average_normalized_score", "cacs", "cacs_percentile", "classification")], function(x) if(length(x) > 0) x[1] else NULL),
          risk_scores = risk_scores,
          average_normalized_score = if (!is.na(row$average_normalized_score)) as.numeric(row$average_normalized_score)[1] else NULL,
          cacs = if (!is.na(row$cacs)) as.numeric(row$cacs)[1] else NULL,
          cacs_percentile = if (!is.na(row$cacs_percentile)) as.numeric(row$cacs_percentile)[1] else NULL,
          classification = if (!is.na(row$classification)) as.character(row$classification)[1] else NULL
        )
      }

      final_result <- list(
        success = TRUE,
        data = list(
          results = formatted_results,
          summary = summary_stats
        )
      )
      
      return(final_result)
    },
    error = function(e) {
      list(
        success = FALSE,
        error = as.character(e$message)[1],
        traceback = paste(capture.output(traceback()), collapse = "\n")
      )
    }
  )
}

# Run the test
cat("Running test analysis...\n")
result <- test_analysis()

# Print the structure
cat("Result structure:\n")
str(result, max.level = 3)

# Print JSON to see exact format
cat("\nJSON output:\n")
json_output <- toJSON(result, pretty = TRUE, auto_unbox = TRUE)
cat(json_output)

# Test a single result entry
if (result$success && length(result$data$results) > 0) {
  cat("\nFirst result entry:\n")
  str(result$data$results[[1]])
  
  cat("\nFirst result as JSON:\n")
  cat(toJSON(result$data$results[[1]], pretty = TRUE, auto_unbox = TRUE))
}