(ns reagent-example-app.core
  (:require 
    ["@blockether/foundation-react" :refer [SQLCockpit ThemeProvider]]
    [reagent.dom.client :as reagent.dom]))

(enable-console-print!)

(defn View []  
  [:> ThemeProvider {:default-theme "light"}
   [:> SQLCockpit]])

(defonce root (reagent.dom/create-root (. js/document (getElementById "app"))))

(defn init []
  (reagent.dom/render root [View]))