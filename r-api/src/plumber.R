# plumber.R
# BioHEART Resilience Calculator API

# Load required libraries
library(plumber)
library(jsonlite)
library(readr)
library(readxl)
library(dplyr)
library(tidyr)
library(httr)
library(BioHEARTResilience) # Your package is already installed in the Docker image

#* @apiTitle BioHEART Resilience Calculator API
#* @apiDescription API for calculating cardiovascular resilience scores using BioHEARTResilience package
#* @apiVersion 1.0.0

#* @filter cors
cors <- function(req, res) {
  origin <- req$HTTP_ORIGIN
  allowed_origins <- c("http://localhost:3000", "https://cadx.vercel.app")

  if (origin %in% allowed_origins) {
    res$setHeader("Access-Control-Allow-Origin", origin)
  }

  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "ok",
    timestamp = Sys.time(),
    version = "1.0.0",
    package_loaded = "BioHEARTResilience" %in% loadedNamespaces()
  )
}

#* Complete resilience analysis from uploaded file
#* @post /api/analyse
#* @param file_url:character URL of the uploaded file from Supabase
#* @param column_mappings:object Mapping of required columns
#* @param cholesterol_unit:character Unit of cholesterol (mmol/L or mg/dL)
#* @param settings:object Analysis settings
function(req, file_url, column_mappings, cholesterol_unit = "mg/dL", settings) {
  tryCatch(
    {
      # Step 1: Download and read file from Supabase
      file_ext <- tools::file_ext(file_url)
      temp_file <- tempfile(fileext = paste0(".", file_ext))

      response <- GET(file_url, write_disk(temp_file, overwrite = TRUE))

      if (status_code(response) != 200) {
        stop("Failed to download file")
      }

      # Read data based on file type
      if (file_ext == "csv") {
        raw_data <- read_csv(temp_file, show_col_types = FALSE)
      } else if (file_ext %in% c("xlsx", "xls")) {
        raw_data <- read_excel(temp_file)
      } else {
        stop("Unsupported file type")
      }

      # Clean up temp file
      unlink(temp_file)

      # Step 2: Extract column names from mappings
      get_col_name <- function(field_name) {
        col <- column_mappings[[field_name]]
        if (is.null(col) || col == "") {
          return(NULL)
        }
        return(col)
      }

      # Step 3: Prepare data using package function
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
        lipid_med_col = get_col_name("lipid_medication"),
        fh_ihd_col = get_col_name("family_history_ihd"),
        ethnicity_col = get_col_name("ethnicity"),
        id_col = get_col_name("subject_id"),
        cholesterol_unit = cholesterol_unit,
        validate = TRUE
      )

      # Step 4: Extract analysis settings
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

      # Step 5: Run the complete resilience analysis
      results <- resilience_analysis(
        data = prepared_data,
        risk_scores = risk_scores,
        risk_region = risk_region,
        percentile_thresholds = percentile_thresholds,
        min_scores = min_scores,
        include_plots = FALSE, # Don't generate plots
        ethnicity_mappings = ethnicity_df
      )

      # Step 6: Generate summary statistics
      if ("classification" %in% names(results)) {
        classification_table <- table(results$classification)
      } else {
        classification_table <- c()
      }

      summary_stats <- list(
        n_total = nrow(results),
        n_complete = sum(!is.na(results$ensemble_score) | !is.na(results$avg_normalized_score)),
        classifications = list(
          resilient = as.numeric(classification_table["Resilient"] %||% 0),
          reference = as.numeric(classification_table["Reference"] %||% 0),
          susceptible = as.numeric(classification_table["Susceptible"] %||% 0),
          other = as.numeric(classification_table["Other"] %||% 0)
        )
      )

      # Return results in format expected by frontend
      # Extract only the final_data from results which contains the analysis output

      # Extract only serializable parts from model diagnostics
      model_diag <- NULL
      if (!is.null(results$model_diagnostics)) {
        # Extract fit statistics with proper numeric conversion
        fit_stats <- NULL
        if (!is.null(results$model_diagnostics$fit_statistics)) {
          fs <- results$model_diagnostics$fit_statistics
          fit_stats <- list(
            log_likelihood = if (!is.null(fs$log_likelihood)) as.numeric(fs$log_likelihood) else NULL,
            aic = if (!is.null(fs$aic)) as.numeric(fs$aic) else NULL,
            bic = if (!is.null(fs$bic)) as.numeric(fs$bic) else NULL,
            n_observations = if (!is.null(fs$n_observations)) as.numeric(fs$n_observations) else NULL,
            theta = if (!is.null(fs$theta)) as.numeric(fs$theta) else NULL,
            converged = if (!is.null(fs$converged)) fs$converged else NULL
          )
        }

        model_diag <- list(
          fit_statistics = fit_stats,
          predicted_observed_correlation = if (!is.null(results$model_diagnostics$predicted_observed_correlation)) {
            as.numeric(results$model_diagnostics$predicted_observed_correlation)
          } else {
            NULL
          }
        )

        # Add percentile test results if available
        if (!is.null(results$model_diagnostics$percentile_uniformity_test)) {
          model_diag$percentile_uniformity_test <- list(
            statistic = as.numeric(results$model_diagnostics$percentile_uniformity_test$statistic),
            p_value = as.numeric(results$model_diagnostics$percentile_uniformity_test$p.value)
          )
        }

        if (!is.null(results$model_diagnostics$percentile_summary)) {
          model_diag$percentile_summary <- as.list(results$model_diagnostics$percentile_summary)
        }
      }

      # Safely extract risk_summary
      risk_sum <- NULL
      if (!is.null(results$risk_summary)) {
        # Extract the attributes from risk_score_summary object
        risk_sum <- list(
          n_complete = results$risk_summary$n_complete,
          n_all_complete = results$risk_summary$n_all_complete,
          n_total = results$risk_summary$n_total,
          coverage = results$risk_summary$coverage,
          all_scores_coverage = results$risk_summary$all_scores_coverage,
          score_columns = results$risk_summary$score_columns,
          score_completeness = as.list(results$risk_summary$score_completeness),
          score_coverage = as.list(results$risk_summary$score_coverage),
          missing_any = results$risk_summary$missing_any,
          missing_all = results$risk_summary$missing_all
        )
      }
      
      # Safely extract ensemble_summary - check if it has a similar structure
      ensemble_sum <- NULL
      if (!is.null(results$ensemble_summary)) {
        # If it's a simple list or has basic attributes, extract them
        if (is.list(results$ensemble_summary)) {
          # Extract all numeric/character elements
          ensemble_sum <- list()
          for (name in names(results$ensemble_summary)) {
            val <- results$ensemble_summary[[name]]
            if (is.numeric(val) || is.character(val) || is.logical(val)) {
              ensemble_sum[[name]] <- val
            } else if (is.list(val) || is.vector(val)) {
              ensemble_sum[[name]] <- as.list(val)
            }
          }
        }
      }
      
      list(
        success = TRUE,
        data = list(
          results = as.data.frame(results$final_data), # Extract the final_data dataframe
          summary = summary_stats,
          model_diagnostics = model_diag,
          risk_summary = risk_sum,
          ensemble_summary = ensemble_sum
        )
      )
    },
    error = function(e) {
      list(
        success = FALSE,
        error = as.character(e$message),
        traceback = paste(capture.output(traceback()), collapse = "\n")
      )
    }
  )
}

# Utility function for default values
`%||%` <- function(x, y) {
  if (is.null(x)) y else x
}
