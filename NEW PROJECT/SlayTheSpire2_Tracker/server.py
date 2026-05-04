import os
import glob
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

SAVE_DIR = r"C:\Users\User\AppData\Roaming\SlayTheSpire2\steam\76561198350717376\profile1\saves\history"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/versions")
def get_versions():
    list_of_files = glob.glob(os.path.join(SAVE_DIR, '*.run'))
    versions = set()
    for file_path in list_of_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                ver = json.load(f).get("build_id")
                if ver: versions.add(ver)
        except:
            continue
    return jsonify(sorted(list(versions)))

@app.route("/api/stats")
def get_stats():
    boss_filter = request.args.get("boss", "f1")
    version_filter = request.args.get("version", "all")
    list_of_files = glob.glob(os.path.join(SAVE_DIR, '*.run'))
    
    stats = {}
    
    for file_path in list_of_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                run_data = json.load(f)
                
            if run_data.get("ascension") != 10: continue
            if run_data.get("game_mode") != "standard": continue
            if version_filter != "all" and run_data.get("build_id") != version_filter: continue
            
            players = run_data.get("players", [])
            if not players: continue
                
            char_id = players[0].get("character", "UNKNOWN").replace("CHARACTER.", "")
            is_win = run_data.get("win", False)
            
            if char_id not in stats:
                stats[char_id] = {"total_runs": 0, "total_wins": 0, "cards": {}, "relics": {}, "special_relics": {}, "deadly_monsters": {}, "encountered_bosses": {}}
            
            char_stat = stats[char_id]
            # 總場次算所有符合條件的場次 (無論 Act 過濾)
            if "deck_size_sum" not in char_stat:
                char_stat["deck_size_sum"] = 0
                char_stat["strike_sum"] = 0
                char_stat["defend_sum"] = 0
                
            char_stat["total_runs"] += 1
            if is_win: 
                char_stat["total_wins"] += 1
            else:
                killed_by = run_data.get("killed_by_encounter", "")
                if not killed_by: killed_by = run_data.get("killed_by_event", "")
                if killed_by:
                    kb = killed_by.replace("ENCOUNTER.", "").replace("EVENT.", "")
                    if kb not in char_stat["deadly_monsters"]:
                        char_stat["deadly_monsters"][kb] = 0
                    char_stat["deadly_monsters"][kb] += 1
            
            deck = players[0].get("deck", [])
            char_stat["deck_size_sum"] += len(deck)
            for dc in deck:
                cid = dc.get("id", "").replace("CARD.", "")
                if cid.startswith("STRIKE") or cid == "STRIKE":
                    char_stat["strike_sum"] += 1
                elif cid.startswith("DEFEND") or cid == "DEFEND":
                    char_stat["defend_sum"] += 1

            # ========================
            #  1. 左側欄位遺物獨立擷取 (boss_filter)
            # ========================
            special_picked = set()
            if boss_filter == "f1":
                map_history = run_data.get("map_point_history", [])
                for act in map_history:
                    if isinstance(act, list):
                        for node in act:
                            if node.get("map_point_type") in ["ancient", "neow"]:
                                for pstat in node.get("player_stats", []):
                                    for rchoice in pstat.get("relic_choices", []):
                                        if rchoice.get("was_picked"):
                                            a_relic = rchoice.get("choice", "").replace("RELIC.", "")
                                            if a_relic:
                                                special_picked.add(a_relic)
            else:
                relics = players[0].get("relics", [])
                for r in relics:
                    floor = r.get("floor_added_to_deck", 0)
                    if boss_filter == "b1" and floor in [17, 18]:
                        special_picked.add(r.get("id", "UNKNOWN").replace("RELIC.", ""))
                    elif boss_filter == "b2" and floor in [34, 35]:
                        special_picked.add(r.get("id", "UNKNOWN").replace("RELIC.", ""))

            for s_relic in special_picked:
                if s_relic not in char_stat["special_relics"]:
                    char_stat["special_relics"][s_relic] = {"picked_runs": 0, "wins": 0}
                char_stat["special_relics"][s_relic]["picked_runs"] += 1
                if is_win: char_stat["special_relics"][s_relic]["wins"] += 1

            # ========================
            #  2. 核心卡牌
            # ========================
            deck = players[0].get("deck", [])
            unique_cards_in_run = set()
            for card in deck:
                c_id = card.get("id", "UNKNOWN").replace("CARD.", "")
                is_base_strike = c_id.startswith("STRIKE_") or c_id == "STRIKE"
                is_base_defend = c_id.startswith("DEFEND_") or c_id == "DEFEND"
                if not is_base_strike and not is_base_defend and c_id != "ASCENDERS_BANE":
                    unique_cards_in_run.add(c_id)
                    
            for c_id in unique_cards_in_run:
                if c_id not in char_stat["cards"]:
                    char_stat["cards"][c_id] = {"picked_runs": 0, "wins": 0}
                char_stat["cards"][c_id]["picked_runs"] += 1
                if is_win: char_stat["cards"][c_id]["wins"] += 1
                    
            # ========================
            #  3. 一般遺物
            # ========================
            relics = players[0].get("relics", [])
            unique_relics = set()
            for r in relics:
                unique_relics.add(r.get("id", "UNKNOWN").replace("RELIC.", ""))
            
            # 從一般遺物中扣除掉已經在特殊左表出現的遺物
            for r_id in (unique_relics - special_picked):
                if r_id not in char_stat["relics"]:
                    char_stat["relics"][r_id] = {"picked_runs": 0, "wins": 0}
                char_stat["relics"][r_id]["picked_runs"] += 1
                if is_win: char_stat["relics"][r_id]["wins"] += 1
                
            # ========================
            #  4. 頭目遭遇數量
            # ========================
            map_history = run_data.get("map_point_history", [])
            for a_idx, act_nodes in enumerate(map_history):
                act_num = str(a_idx + 1)
                if act_num not in char_stat["encountered_bosses"]:
                    char_stat["encountered_bosses"][act_num] = {}
                
                if isinstance(act_nodes, list):
                    for node in act_nodes:
                        if node.get("map_point_type") == "boss":
                            rooms = node.get("rooms", [])
                            if rooms:
                                boss_id = rooms[0].get("model_id", "").replace("ENCOUNTER.", "").replace("_BOSS", "")
                                if boss_id:
                                    if boss_id not in char_stat["encountered_bosses"][act_num]:
                                        char_stat["encountered_bosses"][act_num][boss_id] = 0
                                    char_stat["encountered_bosses"][act_num][boss_id] += 1

        except Exception:
            continue
            
    final_output = {}
    for char_id, data in stats.items():
        overall_wr = round((data["total_wins"] / data["total_runs"] * 100), 1) if data["total_runs"] > 0 else 0
        
        cards_list = []
        for c_id, c_data in data["cards"].items():
            wr = round((c_data["wins"] / c_data["picked_runs"] * 100), 1)
            cards_list.append({"name": c_id, "picked": c_data["picked_runs"], "win_rate": wr})
            
        relics_list = []
        for r_id, r_data in data["relics"].items():
            wr = round((r_data["wins"] / r_data["picked_runs"] * 100), 1)
            relics_list.append({"name": r_id, "picked": r_data["picked_runs"], "win_rate": wr})
            
        special_list = []
        for a_id, a_data in data["special_relics"].items():
            wr = round((a_data["wins"] / a_data["picked_runs"] * 100), 1)
            special_list.append({"name": a_id, "picked": a_data["picked_runs"], "win_rate": wr})
            
        killers_list = []
        for kb, count in data.get("deadly_monsters", {}).items():
            killers_list.append({"name": kb, "kills": count})
            
        boss_encounters_dict = data.get("encountered_bosses", {})
            
        avg_deck = round(data.get("deck_size_sum", 0) / data["total_runs"], 1) if data["total_runs"] > 0 else 0
        avg_strike = round(data.get("strike_sum", 0) / data["total_runs"], 1) if data["total_runs"] > 0 else 0
        avg_defend = round(data.get("defend_sum", 0) / data["total_runs"], 1) if data["total_runs"] > 0 else 0

        final_output[char_id] = {
            "total_runs": data["total_runs"],
            "total_wins": data["total_wins"],
            "overall_win_rate": overall_wr,
            "avg_deck_size": avg_deck,
            "avg_strike": avg_strike,
            "avg_defend": avg_defend,
            "cards": cards_list, 
            "relics": relics_list,
            "special_relics": special_list,
            "deadly_monsters": killers_list,
            "encountered_bosses": boss_encounters_dict
        }
    
    return jsonify(final_output)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
