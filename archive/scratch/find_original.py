import json
import os

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

def extract_original(filename, out_filename):
    print(f"Searching for {filename}...")
    with open(transcript_path, 'r', encoding='utf-8') as f:
        # First let's find the step index where a tool call to view_file for this filename was made
        # and then find the corresponding TOOL_OUTPUT step.
        target_step = None
        for line in f:
            try:
                d = json.loads(line)
            except:
                continue
            
            step_index = d.get("step_index")
            tool_calls = d.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args") or {}
                if name == "view_file":
                    path = args.get("AbsolutePath", "")
                    if filename in path:
                        target_step = step_index
                        print(f"Found view_file call for {filename} at step {target_step}")
                        break
            if target_step is not None:
                break
                
        if target_step is None:
            print(f"No view_file call found for {filename}")
            return
            
        # Now find the output of this step. The next steps might contain the output of this tool call.
        # Let's search from the beginning again (or continue) to find where status is 'DONE' or similar
        # and there is an output field matching this step or containing the file content.
        f.seek(0)
        for line in f:
            try:
                d = json.loads(line)
            except:
                continue
            # Some logging systems log the tool output in the same step, or in a step with the same index,
            # or in a step where source is SYSTEM/MODEL.
            # Let's look for any step with the same index or containing the output.
            if d.get("step_index") == target_step:
                # Check if it has an output or content that contains the file
                output = d.get("output", "")
                if output and isinstance(output, str):
                    # Save it!
                    os.makedirs("scratch", exist_ok=True)
                    with open(os.path.join("scratch", out_filename), "w", encoding="utf-8") as out_f:
                        out_f.write(output)
                    print(f"Successfully extracted {filename} from step {target_step} to scratch/{out_filename} (size: {len(output)} bytes)")
                    return
                # Let's see if the next step has the output
                
        # If we didn't find output directly in target_step, let's search for the next step (target_step + 1)
        # which might be a SYSTEM response or TOOL_OUTPUT containing the tool result.
        f.seek(0)
        for line in f:
            try:
                d = json.loads(line)
            except:
                continue
            if d.get("step_index") in (target_step, target_step + 1):
                # Let's inspect all fields of these steps
                for key, val in d.items():
                    if isinstance(val, str) and len(val) > 1000 and ("html" in filename or "css" in filename):
                        # Save it
                        os.makedirs("scratch", exist_ok=True)
                        with open(os.path.join("scratch", out_filename), "w", encoding="utf-8") as out_f:
                            out_f.write(val)
                        print(f"Extracted from field '{key}' in step {d.get('step_index')} to scratch/{out_filename} (size: {len(val)} bytes)")
                        return

extract_original("index.html", "index_original.html")
extract_original("style.css", "style_original.css")
